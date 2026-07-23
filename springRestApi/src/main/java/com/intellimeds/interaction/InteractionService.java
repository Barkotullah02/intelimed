package com.intellimeds.interaction;

import com.intellimeds.drug.model.Drug;
import com.intellimeds.drug.repository.DrugRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.interaction.dto.*;
import com.intellimeds.interaction.model.DrugInteraction;
import com.intellimeds.interaction.model.InteractionHistory;
import com.intellimeds.interaction.repository.DrugInteractionRepository;
import com.intellimeds.interaction.repository.InteractionHistoryRepository;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final DrugInteractionRepository interactionRepository;
    private final InteractionHistoryRepository historyRepository;
    private final DrugRepository drugRepository;
    private final UserRepository userRepository;

    @Transactional
    public InteractionCheckResponse checkInteractions(List<UUID> drugIds, UUID userId) {
        List<DrugInteraction> interactions = interactionRepository.findByDrugIds(drugIds);

        List<InteractionDetail> details = interactions.stream()
                .map(this::mapToDetail)
                .collect(Collectors.toList());

        String highestSeverity = determineHighestSeverity(details);

        String resultSummary = buildResultSummary(details);

        InteractionHistory history = InteractionHistory.builder()
                .user(userId != null ? userRepository.findById(userId).orElse(null) : null)
                .drugIds(drugIds.stream().map(UUID::toString).collect(Collectors.joining(",")))
                .resultSummary(resultSummary)
                .highestSeverity(highestSeverity)
                .build();
        historyRepository.save(history);

        return InteractionCheckResponse.builder()
                .highestSeverity(highestSeverity)
                .interactions(details)
                .aiExplanation(null)
                .build();
    }

    public List<InteractionHistoryResponse> getInteractionHistory(UUID userId) {
        return historyRepository.findByUserIdOrderByCheckedAtDesc(userId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    public InteractionHistoryResponse getInteractionById(UUID id) {
        InteractionHistory history = historyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InteractionHistory", "id", id));
        return mapToHistoryResponse(history);
    }

    private InteractionDetail mapToDetail(DrugInteraction interaction) {
        return InteractionDetail.builder()
                .drugA(interaction.getDrugA().getBrandName())
                .drugB(interaction.getDrugB().getBrandName())
                .severity(interaction.getSeverity().name())
                .description(interaction.getDescription())
                .recommendation(interaction.getRecommendation())
                .build();
    }

    private String determineHighestSeverity(List<InteractionDetail> details) {
        if (details.isEmpty()) return "NONE";

        for (InteractionDetail detail : details) {
            if ("MAJOR".equals(detail.getSeverity())) return "MAJOR";
        }
        for (InteractionDetail detail : details) {
            if ("MODERATE".equals(detail.getSeverity())) return "MODERATE";
        }
        return "MINOR";
    }

    private String buildResultSummary(List<InteractionDetail> details) {
        if (details.isEmpty()) {
            return "No interactions found between the selected drugs.";
        }
        return String.format("Found %d interaction(s). Highest severity: %s",
                details.size(), determineHighestSeverity(details));
    }

    private InteractionHistoryResponse mapToHistoryResponse(InteractionHistory history) {
        return InteractionHistoryResponse.builder()
                .id(history.getId())
                .drugIds(history.getDrugIds())
                .resultSummary(history.getResultSummary())
                .highestSeverity(history.getHighestSeverity())
                .checkedAt(history.getCheckedAt())
                .build();
    }
}
