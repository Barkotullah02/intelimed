package com.intellimeds.prescription.dto;

import lombok.Data;

import java.util.List;

@Data
public class SavePrescriptionRequest {
    private String advice;
    private List<PrescriptionItem> items;
}
