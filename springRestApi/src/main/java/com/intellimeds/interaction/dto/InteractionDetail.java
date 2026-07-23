package com.intellimeds.interaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionDetail {
    private String drugA;
    private String drugB;
    private String severity;
    private String description;
    private String recommendation;
}
