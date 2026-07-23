package com.intellimeds.drug.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDrugRequest {

    @NotBlank(message = "Generic name is required")
    private String genericName;

    @NotBlank(message = "Brand name is required")
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
    private UUID categoryId;
}
