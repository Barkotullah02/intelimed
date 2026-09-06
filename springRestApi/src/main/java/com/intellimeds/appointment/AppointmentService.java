package com.intellimeds.appointment;

import com.intellimeds.appointment.dto.AppointmentResponse;
import com.intellimeds.appointment.dto.CreateAppointmentRequest;
import com.intellimeds.appointment.model.Appointment;
import com.intellimeds.appointment.repository.AppointmentRepository;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.doctor.repository.DoctorRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getPatientAppointments(UUID patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /** Appointments for the doctor owned by the given user account. */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointmentsForUser(UUID userId) {
        Doctor doctor = doctorRepository.findByProfileUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "user", userId));
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctor.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return mapToResponse(appointment);
    }

    /** Grace period before the scheduled time during which the call may already be joined. */
    private static final long JOIN_GRACE_MINUTES = 5;

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, User patient) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        if (Boolean.FALSE.equals(doctor.getVerified())) {
            throw new IllegalStateException("This doctor is not available for appointments yet");
        }
        if (doctor.getProfile().getUser().getId().equals(patient.getId())) {
            throw new IllegalArgumentException("You cannot book an appointment with yourself");
        }
        if (request.getAppointmentDate() == null
                || request.getAppointmentDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Please choose a time in the future");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .callType(parseCallType(request.getCallType()))
                .reason(request.getReason())
                .notes(request.getNotes())
                .consultationFee(doctor.getConsultationFee())
                .status(Appointment.AppointmentStatus.PENDING)
                .build();

        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    /** Doctor accepts a pending booking. Only the appointment's own doctor may do this. */
    @Transactional
    public AppointmentResponse accept(UUID id, User caller) {
        Appointment appt = requireDoctorOwner(id, caller);
        if (appt.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only a pending appointment can be accepted");
        }
        appt.setStatus(Appointment.AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appt);
        return mapToResponse(appt);
    }

    /** Doctor declines a pending booking. */
    @Transactional
    public AppointmentResponse decline(UUID id, User caller) {
        Appointment appt = requireDoctorOwner(id, caller);
        if (appt.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only a pending appointment can be declined");
        }
        appt.setStatus(Appointment.AppointmentStatus.DECLINED);
        appointmentRepository.save(appt);
        return mapToResponse(appt);
    }

    /** Cancel an appointment. Either the patient or the doctor on it may cancel. */
    @Transactional
    public AppointmentResponse cancel(UUID id, User caller) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        boolean isPatient = appt.getPatient().getId().equals(caller.getId());
        boolean isDoctor = appt.getDoctor().getProfile().getUser().getId().equals(caller.getId());
        if (!isPatient && !isDoctor) {
            throw new AccessDeniedException("You are not part of this appointment");
        }
        if (appt.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("A completed appointment cannot be cancelled");
        }
        appt.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appt);
        return mapToResponse(appt);
    }

    private Appointment requireDoctorOwner(UUID id, User caller) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        if (!appt.getDoctor().getProfile().getUser().getId().equals(caller.getId())) {
            throw new AccessDeniedException("Only the appointment's doctor can do this");
        }
        return appt;
    }

    private Appointment.CallType parseCallType(String value) {
        if (value == null || value.isBlank()) return Appointment.CallType.VIDEO;
        try {
            return Appointment.CallType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid callType '" + value + "'. Allowed: VIDEO, AUDIO");
        }
    }

    @Transactional
    public void deleteAppointment(UUID id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", "id", id);
        }
        appointmentRepository.deleteById(id);
    }

    /** A CONFIRMED appointment becomes joinable from (scheduled time − grace) onward. */
    private boolean isJoinable(Appointment a) {
        return a.getStatus() == Appointment.AppointmentStatus.CONFIRMED
                && a.getAppointmentDate() != null
                && !LocalDateTime.now().isBefore(a.getAppointmentDate().minusMinutes(JOIN_GRACE_MINUTES));
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getProfile().getFullName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .appointmentDate(appointment.getAppointmentDate())
                .status(appointment.getStatus().name())
                .callType(appointment.getCallType() == null ? "VIDEO" : appointment.getCallType().name())
                .joinable(isJoinable(appointment))
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .consultationFee(appointment.getConsultationFee())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
