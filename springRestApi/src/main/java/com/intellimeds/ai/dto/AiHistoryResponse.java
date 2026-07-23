package com.intellimeds.ai.dto;

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
public class AiHistoryResponse {
    private UUID id;
    private String prompt;
    private String response;
    private String provider;
    private String requestType;
    private LocalDateTime createdAt;
}
