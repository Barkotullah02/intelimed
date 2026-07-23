package com.intellimeds.appointment.repository;

import com.intellimeds.appointment.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(UUID patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDesc(UUID doctorId);
}
