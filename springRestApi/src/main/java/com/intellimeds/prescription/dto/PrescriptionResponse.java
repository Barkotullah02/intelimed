package com.intellimeds.prescription.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PrescriptionResponse {
    private UUID id;
    private UUID consultationId;
    private UUID appointmentId;
    private String doctorName;
    private String patientName;
    private String advice;
    private List<PrescriptionItem> items;
    private LocalDateTime updatedAt;
}
