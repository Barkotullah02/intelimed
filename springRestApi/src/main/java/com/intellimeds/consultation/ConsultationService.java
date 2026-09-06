package com.intellimeds.consultation;

import com.intellimeds.appointment.model.Appointment;
import com.intellimeds.appointment.repository.AppointmentRepository;
import com.intellimeds.consultation.dto.ConsultationResponse;
import com.intellimeds.consultation.model.ConsultationSession;
import com.intellimeds.consultation.repository.ConsultationSessionRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConsultationService {

    private final ConsultationSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @Value("${webrtc.stun-urls:stun:stun.l.google.com:19302}")
    private String stunUrls;
    @Value("${webrtc.turn-url:}")
    private String turnUrl;
    @Value("${webrtc.turn-username:}")
    private String turnUsername;
    @Value("${webrtc.turn-credential:}")
    private String turnCredential;
    @Value("${webrtc.signaling-url:ws://localhost:8080/ws/signal}")
    private String signalingUrl;

    /** How early (minutes before the scheduled time) a confirmed call may be joined. */
    private static final long JOIN_GRACE_MINUTES = 5;

    /**
     * Start (or rejoin) the call for a CONFIRMED appointment, once it is time. This is the ONLY
     * way to open a consultation — there is no ad-hoc "call a doctor now" path. Either participant
     * (patient or the appointment's doctor) may call it; the first call creates the shared room,
     * later calls return the same room so both sides meet.
     */
    @Transactional
    public ConsultationResponse startFromAppointment(UUID appointmentId, String callerEmail) {
        User caller = requireUser(callerEmail);
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        boolean isPatient = appt.getPatient().getId().equals(caller.getId());
        boolean isDoctor = appt.getDoctor().getProfile().getUser().getId().equals(caller.getId());
        if (!isPatient && !isDoctor) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not part of this appointment");
        }
        if (appt.getStatus() != Appointment.AppointmentStatus.CONFIRMED
                && appt.getStatus() != Appointment.AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("This appointment has not been accepted by the doctor yet");
        }
        if (LocalDateTime.now().isBefore(appt.getAppointmentDate().minusMinutes(JOIN_GRACE_MINUTES))) {
            throw new IllegalStateException("This consultation opens at the scheduled time (" + appt.getAppointmentDate() + ")");
        }

        // One shared session per appointment: create on the first join, reuse thereafter.
        ConsultationSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> sessionRepository.save(ConsultationSession.builder()
                        .roomCode(generateRoomCode())
                        .patient(appt.getPatient())
                        .doctor(appt.getDoctor())
                        .appointment(appt)
                        .callType(appt.getCallType() == null
                                ? ConsultationSession.CallType.VIDEO
                                : ConsultationSession.CallType.valueOf(appt.getCallType().name()))
                        .status(ConsultationSession.Status.SCHEDULED)
                        .build()));

        if (session.getStatus() != ConsultationSession.Status.ACTIVE
                && session.getStatus() != ConsultationSession.Status.CANCELLED) {
            session.setStatus(ConsultationSession.Status.ACTIVE);
            if (session.getStartedAt() == null) session.setStartedAt(LocalDateTime.now());
            session.setEndedAt(null);
            sessionRepository.save(session);
        }
        return toResponse(session, caller.getId());
    }

    public List<ConsultationResponse> listMine(String callerEmail) {
        User caller = requireUser(callerEmail);
        return sessionRepository.findAllForUser(caller.getId()).stream()
                .map(s -> toResponse(s, caller.getId()))
                .collect(Collectors.toList());
    }

    public ConsultationResponse get(UUID id, String callerEmail) {
        User caller = requireUser(callerEmail);
        ConsultationSession session = requireParticipant(id, caller);
        return toResponse(session, caller.getId());
    }

    @Transactional
    public ConsultationResponse join(UUID id, String callerEmail) {
        User caller = requireUser(callerEmail);
        ConsultationSession session = requireParticipant(id, caller);
        if (session.getStatus() == ConsultationSession.Status.CANCELLED) {
            throw new IllegalStateException("This consultation was cancelled");
        }
        // (Re)activate on join: a SCHEDULED call starts, and an ENDED one can be re-joined
        // (accidental hang-up, dropped connection, or the other party rejoining). Only a
        // CANCELLED session is terminal.
        if (session.getStatus() != ConsultationSession.Status.ACTIVE) {
            session.setStatus(ConsultationSession.Status.ACTIVE);
            if (session.getStartedAt() == null) session.setStartedAt(LocalDateTime.now());
            session.setEndedAt(null);
            sessionRepository.save(session);
        }
        return toResponse(session, caller.getId());
    }

    @Transactional
    public ConsultationResponse end(UUID id, String callerEmail) {
        User caller = requireUser(callerEmail);
        ConsultationSession session = requireParticipant(id, caller);
        if (session.getStatus() != ConsultationSession.Status.ENDED) {
            session.setStatus(ConsultationSession.Status.ENDED);
            session.setEndedAt(LocalDateTime.now());
            sessionRepository.save(session);
            // Mark the backing appointment as completed so it leaves the "upcoming" list.
            Appointment appt = session.getAppointment();
            if (appt != null && appt.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {
                appt.setStatus(Appointment.AppointmentStatus.COMPLETED);
                appointmentRepository.save(appt);
            }
        }
        return toResponse(session, caller.getId());
    }

    // ---- helpers -------------------------------------------------------------

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ConsultationSession requireParticipant(UUID id, User caller) {
        ConsultationSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));
        if (!isParticipant(session, caller.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not a participant of this consultation");
        }
        return session;
    }

    private boolean isParticipant(ConsultationSession session, UUID userId) {
        return session.getPatient().getId().equals(userId)
                || session.getDoctor().getProfile().getUser().getId().equals(userId);
    }

    private String generateRoomCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        } while (sessionRepository.existsByRoomCode(code));
        return code;
    }

    private List<ConsultationResponse.IceServer> buildIceServers() {
        List<ConsultationResponse.IceServer> servers = new ArrayList<>();
        List<String> stun = new ArrayList<>();
        for (String u : stunUrls.split(",")) {
            if (!u.isBlank()) stun.add(u.trim());
        }
        if (!stun.isEmpty()) {
            servers.add(ConsultationResponse.IceServer.builder().urls(stun).build());
        }
        if (turnUrl != null && !turnUrl.isBlank()) {
            servers.add(ConsultationResponse.IceServer.builder()
                    .urls(List.of(turnUrl.trim()))
                    .username(turnUsername)
                    .credential(turnCredential)
                    .build());
        }
        return servers;
    }

    private ConsultationResponse toResponse(ConsultationSession s, UUID currentUserId) {
        UUID doctorUserId = s.getDoctor().getProfile().getUser().getId();
        return ConsultationResponse.builder()
                .id(s.getId())
                .roomCode(s.getRoomCode())
                .callType(s.getCallType().name())
                .status(s.getStatus().name())
                .patientId(s.getPatient().getId())
                .patientName(s.getPatient().getName())
                .doctorId(s.getDoctor().getId())
                .doctorName(s.getDoctor().getProfile().getFullName())
                .createdAt(s.getCreatedAt())
                .startedAt(s.getStartedAt())
                .endedAt(s.getEndedAt())
                .self_isDoctor(doctorUserId.equals(currentUserId))
                .signalingUrl(signalingUrl)
                .iceServers(buildIceServers())
                .build();
    }
}
