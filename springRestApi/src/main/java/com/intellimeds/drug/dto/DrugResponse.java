package com.intellimeds.drug.dto;

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
public class DrugResponse {
    private UUID id;
    private String genericName;
    private String brandName;
    private String manufacturerName;
    private String description;
    private String uses;
    private String dosageForm;
    private String dosage;
    private String sideEffects;
    private String contraindications;
    private String pregnancySafety;
    private String storage;
    private String imageUrl;
    private String categoryName;
    private LocalDateTime createdAt;
}
