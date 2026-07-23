package com.intellimeds.reminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {
    private UUID id;
    private UUID drugId;
    private String drugName;
    private LocalTime reminderTime;
    private String frequency;
    private String dosage;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean notificationEnabled;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
