package com.intellimeds.medication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationHistoryResponse {
    private UUID id;
    private UUID drugId;
    private String drugName;
    private LocalDate date;
    private String status;
    private String dosage;
    private String notes;
    private LocalDateTime createdAt;
}
