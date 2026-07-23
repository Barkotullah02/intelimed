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
public class InteractionHistoryResponse {
    private UUID id;
    private String drugIds;
    private String resultSummary;
    private String highestSeverity;
    private LocalDateTime checkedAt;
}
