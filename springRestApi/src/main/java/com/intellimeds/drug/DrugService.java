package com.intellimeds.drug;

import com.intellimeds.drug.dto.CreateDrugRequest;
import com.intellimeds.drug.dto.DrugResponse;
import com.intellimeds.drug.model.Drug;
import com.intellimeds.drug.model.DrugAlternative;
import com.intellimeds.drug.repository.DrugAlternativeRepository;
import com.intellimeds.drug.repository.DrugRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrugService {

    private final DrugRepository drugRepository;
    private final DrugAlternativeRepository drugAlternativeRepository;

    public List<DrugResponse> getAllDrugs() {
        return drugRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DrugResponse getDrugById(UUID id) {
        Drug drug = drugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", id));
        return mapToResponse(drug);
    }

    public List<DrugResponse> searchDrugs(String keyword) {
        return drugRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<String> getDrugSuggestions(String keyword) {
        return drugRepository.findSuggestions(keyword).stream()
                .map(Drug::getBrandName)
                .collect(Collectors.toList());
    }

    public List<DrugResponse> getAlternatives(UUID drugId) {
        Drug drug = drugRepository.findById(drugId)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", drugId));

        List<DrugAlternative> alternatives = drugAlternativeRepository.findByDrugId(drugId);
        List<Drug> alternativeDrugs = alternatives.stream()
                .map(DrugAlternative::getAlternativeDrug)
                .collect(Collectors.toList());

        return alternativeDrugs.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DrugResponse createDrug(CreateDrugRequest request) {
        Drug drug = Drug.builder()
                .genericName(request.getGenericName())
                .brandName(request.getBrandName())
                .manufacturerName(request.getManufacturerName())
                .description(request.getDescription())
                .uses(request.getUses())
                .dosageForm(request.getDosageForm())
                .dosage(request.getDosage())
                .sideEffects(request.getSideEffects())
                .contraindications(request.getContraindications())
                .pregnancySafety(request.getPregnancySafety())
                .storage(request.getStorage())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .build();

        drugRepository.save(drug);
        return mapToResponse(drug);
    }

    @Transactional
    public DrugResponse updateDrug(UUID id, CreateDrugRequest request) {
        Drug drug = drugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", id));

        drug.setGenericName(request.getGenericName());
        drug.setBrandName(request.getBrandName());
        drug.setManufacturerName(request.getManufacturerName());
        drug.setDescription(request.getDescription());
        drug.setUses(request.getUses());
        drug.setDosageForm(request.getDosageForm());
        drug.setDosage(request.getDosage());
        drug.setSideEffects(request.getSideEffects());
        drug.setContraindications(request.getContraindications());
        drug.setPregnancySafety(request.getPregnancySafety());
        drug.setStorage(request.getStorage());
        drug.setImageUrl(request.getImageUrl());

        drugRepository.save(drug);
        return mapToResponse(drug);
    }

    @Transactional
    public void deleteDrug(UUID id) {
        Drug drug = drugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", id));
        drug.setIsActive(false);
        drugRepository.save(drug);
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
