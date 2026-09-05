package com.intellimeds.ai;

import com.intellimeds.ai.client.GeminiClient;
import com.intellimeds.ai.dto.*;
import com.intellimeds.ai.model.AiHistory;
import com.intellimeds.ai.model.AiProvider;
import com.intellimeds.ai.repository.AiHistoryRepository;
import com.intellimeds.ai.repository.AiProviderRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final AiProviderRepository providerRepository;
    private final AiHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final GeminiClient geminiClient;

    private static final String DISCLAIMER =
            "This information is for education only and is not a substitute for professional " +
            "medical advice. Always consult your doctor or pharmacist.";

    public List<AiProviderResponse> getProviders() {
        return providerRepository.findAll().stream()
                .map(this::mapToProviderResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AiProviderResponse updateProvider(UpdateProviderRequest request) {
        AiProvider.ProviderType providerType = AiProvider.ProviderType.valueOf(
                request.getProviderType().toUpperCase());

        providerRepository.findByIsSelectedTrue().ifPresent(p -> {
            p.setIsSelected(false);
            providerRepository.save(p);
        });

        AiProvider provider = providerRepository.findByProviderType(providerType)
                .orElseThrow(() -> new ResourceNotFoundException("AI Provider", "type", request.getProviderType()));

        provider.setIsSelected(true);
        providerRepository.save(provider);

        return mapToProviderResponse(provider);
    }

    @Transactional
    public AiExplainResponse explain(AiExplainRequest request, UUID userId) {
        AiProvider selectedProvider = providerRepository.findByIsSelectedTrue().orElse(null);
        boolean useGemini = selectedProvider != null
                && selectedProvider.getProviderType() == AiProvider.ProviderType.GEMINI
                && geminiClient.isConfigured();

        String userContent = request.getContent()
                + (request.getContext() != null && !request.getContext().isBlank()
                        ? "\n\nContext: " + request.getContext() : "");

        String explanation;
        String providerLabel;
        if (useGemini) {
            try {
                explanation = geminiClient.complete(GeminiClient.MEDICAL_SYSTEM_PROMPT, userContent);
                providerLabel = "GEMINI";
            } catch (GeminiClient.GeminiException e) {
                // Never fail the request because the LLM is unreachable — degrade gracefully.
                explanation = offlineExplanation(request.getContent());
                providerLabel = "OFFLINE (Gemini unavailable)";
            }
        } else {
            explanation = offlineExplanation(request.getContent());
            providerLabel = selectedProvider != null ? selectedProvider.getName() : "OFFLINE";
        }

        AiHistory history = AiHistory.builder()
                .user(userId != null ? userRepository.findById(userId).orElse(null) : null)
                .prompt(request.getContent())
                .response(explanation)
                .provider(providerLabel)
                .requestType("EXPLAIN")
                .build();
        historyRepository.save(history);

        return AiExplainResponse.builder()
                .explanation(explanation)
                .recommendation(null)
                .warnings(DISCLAIMER)
                .build();
    }

    public List<AiHistoryResponse> getAiHistory(UUID userId) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAiHistory(UUID historyId) {
        if (!historyRepository.existsById(historyId)) {
            throw new ResourceNotFoundException("AI History", "id", historyId);
        }
        historyRepository.deleteById(historyId);
    }

    /** Fallback used when no online AI provider is selected/configured. */
    private String offlineExplanation(String content) {
        return "AI explanations are currently offline. Your question was: \"" + content + "\".\n\n" +
               "To get a real plain-language explanation, an administrator can select the Gemini " +
               "provider and set a GEMINI_API_KEY. In the meantime, please consult your doctor or " +
               "pharmacist for personalized advice.";
    }

    private AiProviderResponse mapToProviderResponse(AiProvider provider) {
        return AiProviderResponse.builder()
                .id(provider.getId())
                .name(provider.getName())
                .providerType(provider.getProviderType().name())
                .isActive(provider.getIsActive())
                .isSelected(provider.getIsSelected())
                .build();
    }

    private AiHistoryResponse mapToHistoryResponse(AiHistory history) {
        return AiHistoryResponse.builder()
                .id(history.getId())
                .prompt(history.getPrompt())
                .response(history.getResponse())
                .provider(history.getProvider())
                .requestType(history.getRequestType())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
