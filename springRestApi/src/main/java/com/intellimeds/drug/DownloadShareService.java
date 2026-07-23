package com.intellimeds.drug;

import com.intellimeds.drug.dto.DrugResponse;
import com.intellimeds.drug.dto.ShareRequest;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.drug.model.Drug;
import com.intellimeds.drug.repository.DrugRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DownloadShareService {

    private final DrugRepository drugRepository;

    public String getDownloadUrl(UUID drugId) {
        Drug drug = drugRepository.findById(drugId)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", drugId));
        return "/api/drugs/" + drugId + "/download";
    }

    public String shareDrug(UUID drugId, ShareRequest request) {
        Drug drug = drugRepository.findById(drugId)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", drugId));

        return "Drug information shared successfully to " + request.getRecipientEmail();
    }

    public List<DrugResponse> getAlternatives(UUID drugId) {
        Drug drug = drugRepository.findById(drugId)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", drugId));

        return drugRepository.findByIsActiveTrue().stream()
                .filter(d -> !d.getId().equals(drugId))
                .limit(5)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DrugResponse mapToResponse(Drug drug) {
        return DrugResponse.builder()
                .id(drug.getId())
                .genericName(drug.getGenericName())
                .brandName(drug.getBrandName())
                .manufacturerName(drug.getManufacturerName())
                .description(drug.getDescription())
                .uses(drug.getUses())
                .dosageForm(drug.getDosageForm())
                .dosage(drug.getDosage())
                .sideEffects(drug.getSideEffects())
                .contraindications(drug.getContraindications())
                .pregnancySafety(drug.getPregnancySafety())
                .storage(drug.getStorage())
                .imageUrl(drug.getImageUrl())
                .categoryName(drug.getCategory() != null ? drug.getCategory().getName() : null)
                .createdAt(drug.getCreatedAt())
                .build();
    }
}
