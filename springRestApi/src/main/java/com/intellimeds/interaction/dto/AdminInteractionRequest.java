package com.intellimeds.interaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminInteractionRequest {

    @NotNull(message = "drugAId is required")
    private UUID drugAId;

    @NotNull(message = "drugBId is required")
    private UUID drugBId;

    @NotBlank(message = "Severity is required (MAJOR, MODERATE, MINOR or UNKNOWN)")
    private String severity;

    private String description;
    private String recommendation;
}
