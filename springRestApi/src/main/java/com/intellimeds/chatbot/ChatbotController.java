package com.intellimeds.chatbot;

import com.intellimeds.chatbot.dto.*;
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
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        ChatResponse response = chatbotService.sendMessage(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ChatHistoryResponse>>> getChatHistory(
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        List<ChatHistoryResponse> history = chatbotService.getChatHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved successfully", history));
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Void>> deleteChatHistory(Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        chatbotService.deleteChatHistory(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history deleted successfully", null));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(null);
    }
}
