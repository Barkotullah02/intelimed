package com.intellimeds.interaction.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/** One known interaction from a single drug's perspective (the "other" drug + severity). */
@Data
@Builder
public class DrugInteractionSummary {
    private UUID otherDrugId;
    private String otherDrugName;
    private String severity;
}
