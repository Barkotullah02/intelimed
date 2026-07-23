package com.intellimeds.ai;

import com.intellimeds.ai.dto.*;
import com.intellimeds.dto.ApiResponse;
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
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<AiProviderResponse>>> getProviders() {
        List<AiProviderResponse> providers = aiService.getProviders();
        return ResponseEntity.ok(ApiResponse.success("Providers retrieved successfully", providers));
    }

    @PutMapping("/provider")
    public ResponseEntity<ApiResponse<AiProviderResponse>> updateProvider(
            @Valid @RequestBody UpdateProviderRequest request) {
        AiProviderResponse response = aiService.updateProvider(request);
        return ResponseEntity.ok(ApiResponse.success("Provider updated successfully", response));
    }

    @PostMapping("/explain")
    public ResponseEntity<ApiResponse<AiExplainResponse>> explain(
            @Valid @RequestBody AiExplainRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        AiExplainResponse response = aiService.explain(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Explanation generated", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AiHistoryResponse>>> getHistory(
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<AiHistoryResponse> history = aiService.getAiHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("History retrieved successfully", history));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable UUID id) {
        aiService.deleteAiHistory(id);
        return ResponseEntity.ok(ApiResponse.success("History deleted successfully", null));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(null);
    }
}
