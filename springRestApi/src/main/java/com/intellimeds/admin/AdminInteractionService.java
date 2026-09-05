package com.intellimeds.admin;

import com.intellimeds.drug.model.Drug;
import com.intellimeds.drug.repository.DrugRepository;
import com.intellimeds.dto.PagedResponse;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.interaction.dto.AdminInteractionRequest;
import com.intellimeds.interaction.dto.AdminInteractionResponse;
import com.intellimeds.interaction.model.DrugInteraction;
import com.intellimeds.interaction.repository.DrugInteractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminInteractionService {

    private final DrugInteractionRepository interactionRepository;
    private final DrugRepository drugRepository;

    @Transactional(readOnly = true)
    public PagedResponse<AdminInteractionResponse> list(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DrugInteraction> result = (query == null || query.isBlank())
                ? interactionRepository.findAll(pageable)
                : interactionRepository.searchByDrugName(query.trim(), pageable);
        return PagedResponse.<AdminInteractionResponse>builder()
                .content(result.map(this::toResponse).getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminInteractionResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public AdminInteractionResponse create(AdminInteractionRequest request) {
        Drug drugA = findDrug(request.getDrugAId());
        Drug drugB = findDrug(request.getDrugBId());
        DrugInteraction interaction = DrugInteraction.builder()
                .drugA(drugA)
                .drugB(drugB)
                .severity(parseSeverity(request.getSeverity()))
                .description(request.getDescription())
                .recommendation(request.getRecommendation())
                .build();
        return toResponse(interactionRepository.save(interaction));
    }

    @Transactional
    public AdminInteractionResponse update(UUID id, AdminInteractionRequest request) {
        DrugInteraction interaction = findOrThrow(id);
        interaction.setDrugA(findDrug(request.getDrugAId()));
        interaction.setDrugB(findDrug(request.getDrugBId()));
        interaction.setSeverity(parseSeverity(request.getSeverity()));
        interaction.setDescription(request.getDescription());
        interaction.setRecommendation(request.getRecommendation());
        return toResponse(interactionRepository.save(interaction));
    }

    @Transactional
    public void delete(UUID id) {
        if (!interactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Interaction", "id", id);
        }
        interactionRepository.deleteById(id);
    }

    private DrugInteraction findOrThrow(UUID id) {
        return interactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interaction", "id", id));
    }

    private Drug findDrug(UUID id) {
        return drugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", id));
    }

    private DrugInteraction.Severity parseSeverity(String value) {
        try {
            return DrugInteraction.Severity.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid severity '" + value + "'. Allowed: MAJOR, MODERATE, MINOR, UNKNOWN");
        }
    }

    private AdminInteractionResponse toResponse(DrugInteraction di) {
        return AdminInteractionResponse.builder()
                .id(di.getId())
                .drugAId(di.getDrugA().getId())
                .drugAName(displayName(di.getDrugA()))
                .drugBId(di.getDrugB().getId())
                .drugBName(displayName(di.getDrugB()))
                .severity(di.getSeverity().name())
                .description(di.getDescription())
                .recommendation(di.getRecommendation())
                .createdAt(di.getCreatedAt())
                .build();
    }

    private String displayName(Drug drug) {
        return (drug.getBrandName() != null && !drug.getBrandName().isBlank())
                ? drug.getBrandName()
                : drug.getGenericName();
    }
}
