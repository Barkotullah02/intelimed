package com.intellimeds.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDateTime appointmentDate;
    private String status;
    private String reason;
    private String notes;
    private Double consultationFee;
    private LocalDateTime createdAt;
}
