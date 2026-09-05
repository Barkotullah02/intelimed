package com.intellimeds.consultation.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateConsultationRequest {
    /** Required when a patient initiates: the Doctor to call. */
    private UUID doctorId;
    /** Required when a doctor initiates: the patient (User) to call. */
    private UUID patientId;
    /** Optional appointment this call fulfils. */
    private UUID appointmentId;
    /** "VIDEO" (default) or "AUDIO". */
    private String callType;
}
