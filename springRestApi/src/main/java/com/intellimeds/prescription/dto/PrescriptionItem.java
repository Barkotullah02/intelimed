package com.intellimeds.prescription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One medicine line on a prescription. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {
    private String medicine;
    private String dosage;      // e.g. "500 mg"
    private String frequency;   // e.g. "Twice daily"
    private String duration;    // e.g. "7 days"
    private String instructions; // e.g. "After meals"
}
