package com.intellimeds.appointment.dto;

import jakarta.validation.constraints.NotNull;
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
public class CreateAppointmentRequest {

    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;

    private String reason;
    private String notes;
}
