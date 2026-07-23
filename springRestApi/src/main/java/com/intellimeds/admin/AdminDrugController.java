package com.intellimeds.admin;

import com.intellimeds.drug.dto.CreateDrugRequest;
import com.intellimeds.drug.dto.DrugResponse;
import com.intellimeds.dto.ApiResponse;
import com.intellimeds.drug.DrugService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/drugs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDrugController {

    private final DrugService drugService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DrugResponse>>> getAllDrugs() {
        List<DrugResponse> drugs = drugService.getAllDrugs();
        return ResponseEntity.ok(ApiResponse.success("Drugs retrieved", drugs));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DrugResponse>> getDrugById(@PathVariable UUID id) {
        DrugResponse drug = drugService.getDrugById(id);
        return ResponseEntity.ok(ApiResponse.success("Drug retrieved", drug));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DrugResponse>> createDrug(
            @Valid @RequestBody CreateDrugRequest request) {
        DrugResponse drug = drugService.createDrug(request);
        return ResponseEntity.ok(ApiResponse.success("Drug created", drug));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DrugResponse>> updateDrug(
            @PathVariable UUID id,
            @Valid @RequestBody CreateDrugRequest request) {
        DrugResponse drug = drugService.updateDrug(id, request);
        return ResponseEntity.ok(ApiResponse.success("Drug updated", drug));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDrug(@PathVariable UUID id) {
        drugService.deleteDrug(id);
        return ResponseEntity.ok(ApiResponse.success("Drug deleted", null));
    }
}
