package com.intellimeds.interaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionCheckResponse {
    private String highestSeverity;
    private List<InteractionDetail> interactions;
    private String aiExplanation;
}
