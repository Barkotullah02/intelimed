package com.intellimeds.admin;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.dto.PagedResponse;
import com.intellimeds.interaction.dto.AdminInteractionRequest;
import com.intellimeds.interaction.dto.AdminInteractionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin — Manage Drug Interactions (Add / Update / Delete), per the use-case diagram.
 * List is paginated because the catalogue holds 150k+ interactions.
 */
@RestController
@RequestMapping("/api/admin/interactions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInteractionController {

    private final AdminInteractionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AdminInteractionResponse>>> list(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<AdminInteractionResponse> result = service.list(query, page, Math.min(size, 100));
        return ResponseEntity.ok(ApiResponse.success("Interactions retrieved", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminInteractionResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Interaction retrieved", service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminInteractionResponse>> create(
            @Valid @RequestBody AdminInteractionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interaction created", service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminInteractionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody AdminInteractionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Interaction updated", service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Interaction deleted", null));
    }
}
