package com.intellimeds.reminder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReminderRequest {

    @NotNull(message = "Drug ID is required")
    private UUID drugId;

    @NotNull(message = "Reminder time is required")
    private LocalTime reminderTime;

    @NotBlank(message = "Frequency is required")
    private String frequency;

    private String dosage;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean notificationEnabled;
}
