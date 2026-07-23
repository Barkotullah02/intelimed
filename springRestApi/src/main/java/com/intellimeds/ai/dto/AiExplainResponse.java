package com.intellimeds.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiExplainResponse {
    private String explanation;
    private String recommendation;
    private String warnings;
}
