package com.intellimeds.consultation;

import com.intellimeds.appointment.model.Appointment;
import com.intellimeds.appointment.repository.AppointmentRepository;
import com.intellimeds.consultation.dto.ConsultationResponse;
import com.intellimeds.consultation.dto.CreateConsultationRequest;
import com.intellimeds.consultation.model.ConsultationSession;
import com.intellimeds.consultation.repository.ConsultationSessionRepository;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.doctor.repository.DoctorRepository;
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
    private final DoctorRepository doctorRepository;
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

    @Transactional
    public ConsultationResponse create(CreateConsultationRequest request, String callerEmail) {
        User caller = requireUser(callerEmail);

        User patient;
        Doctor doctor;

        if (request.getDoctorId() != null) {
            // Patient-initiated: caller is the patient, calling the given doctor.
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));
            patient = caller;
        } else if (request.getPatientId() != null) {
            // Doctor-initiated: caller must own a doctor profile, calling the given patient.
            doctor = doctorRepository.findByProfileUserId(caller.getId())
                    .orElseThrow(() -> new IllegalStateException("Only a doctor can start a consultation with a patient"));
            patient = userRepository.findById(request.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getPatientId()));
        } else {
            throw new IllegalArgumentException("Provide either doctorId (patient calling) or patientId (doctor calling)");
        }

        if (Boolean.FALSE.equals(doctor.getVerified())) {
            throw new IllegalStateException("This doctor is not verified for consultations yet");
        }
        if (doctor.getProfile().getUser().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You cannot start a consultation with yourself");
        }

        ConsultationSession.CallType callType = parseCallType(request.getCallType());

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));
        }

        ConsultationSession session = ConsultationSession.builder()
                .roomCode(generateRoomCode())
                .patient(patient)
                .doctor(doctor)
                .appointment(appointment)
                .callType(callType)
                .status(ConsultationSession.Status.SCHEDULED)
                .build();

        return toResponse(sessionRepository.save(session), caller.getId());
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

    private ConsultationSession.CallType parseCallType(String value) {
        if (value == null || value.isBlank()) return ConsultationSession.CallType.VIDEO;
        try {
            return ConsultationSession.CallType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid callType '" + value + "'. Allowed: VIDEO, AUDIO");
        }
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
