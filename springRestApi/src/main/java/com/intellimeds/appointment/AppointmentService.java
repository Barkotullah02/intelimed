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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    public List<AppointmentResponse> getPatientAppointments(UUID patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, User patient) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .reason(request.getReason())
                .notes(request.getNotes())
                .consultationFee(doctor.getConsultationFee())
                .status(Appointment.AppointmentStatus.PENDING)
                .build();

        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(UUID id, Appointment.AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    @Transactional
    public void deleteAppointment(UUID id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", "id", id);
        }
        appointmentRepository.deleteById(id);
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
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .consultationFee(appointment.getConsultationFee())
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
