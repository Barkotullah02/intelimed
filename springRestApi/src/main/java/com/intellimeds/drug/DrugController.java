package com.intellimeds.drug;

import com.intellimeds.drug.dto.CreateDrugRequest;
import com.intellimeds.drug.dto.DrugResponse;
import com.intellimeds.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drugs")
@RequiredArgsConstructor
public class DrugController {

    private final DrugService drugService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DrugResponse>>> getAllDrugs() {
        List<DrugResponse> drugs = drugService.getAllDrugs();
        return ResponseEntity.ok(ApiResponse.success("Drugs retrieved successfully", drugs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DrugResponse>> getDrugById(@PathVariable UUID id) {
        DrugResponse drug = drugService.getDrugById(id);
        return ResponseEntity.ok(ApiResponse.success("Drug retrieved successfully", drug));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DrugResponse>>> searchDrugs(
            @RequestParam String keyword) {
        List<DrugResponse> drugs = drugService.searchDrugs(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results", drugs));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<String>>> getDrugSuggestions(
            @RequestParam String keyword) {
        List<String> suggestions = drugService.getDrugSuggestions(keyword);
        return ResponseEntity.ok(ApiResponse.success("Suggestions retrieved", suggestions));
    }

    @GetMapping("/{id}/alternatives")
    public ResponseEntity<ApiResponse<List<DrugResponse>>> getAlternatives(
            @PathVariable UUID id) {
        List<DrugResponse> alternatives = drugService.getAlternatives(id);
        return ResponseEntity.ok(ApiResponse.success("Alternatives retrieved", alternatives));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DrugResponse>> createDrug(
            @Valid @RequestBody CreateDrugRequest request) {
        DrugResponse drug = drugService.createDrug(request);
        return ResponseEntity.ok(ApiResponse.success("Drug created successfully", drug));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DrugResponse>> updateDrug(
            @PathVariable UUID id,
            @Valid @RequestBody CreateDrugRequest request) {
        DrugResponse drug = drugService.updateDrug(id, request);
        return ResponseEntity.ok(ApiResponse.success("Drug updated successfully", drug));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDrug(@PathVariable UUID id) {
        drugService.deleteDrug(id);
        return ResponseEntity.ok(ApiResponse.success("Drug deleted successfully", null));
    }
}
