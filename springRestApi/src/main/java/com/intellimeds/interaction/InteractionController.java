package com.intellimeds.interaction;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.interaction.dto.*;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;
    private final UserRepository userRepository;

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<InteractionCheckResponse>> checkInteractions(
            @Valid @RequestBody InteractionCheckRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        InteractionCheckResponse response = interactionService.checkInteractions(
                request.getDrugIds(), userId);
        return ResponseEntity.ok(ApiResponse.success("Interactions checked successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InteractionHistoryResponse>>> getHistory(
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<InteractionHistoryResponse> history = interactionService.getInteractionHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("History retrieved successfully", history));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InteractionHistoryResponse>> getInteractionById(
            @PathVariable UUID id) {
        InteractionHistoryResponse response = interactionService.getInteractionById(id);
        return ResponseEntity.ok(ApiResponse.success("Interaction retrieved successfully", response));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(null);
    }
}
