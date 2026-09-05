package com.intellimeds.interaction.dto;

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
public class AdminInteractionResponse {
    private UUID id;
    private UUID drugAId;
    private String drugAName;
    private UUID drugBId;
    private String drugBName;
    private String severity;
    private String description;
    private String recommendation;
    private LocalDateTime createdAt;
}
