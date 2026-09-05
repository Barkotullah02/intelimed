package com.intellimeds.chatbot;

import com.intellimeds.ai.client.GeminiClient;
import com.intellimeds.chatbot.dto.*;
import com.intellimeds.chatbot.model.ChatHistory;
import com.intellimeds.chatbot.repository.ChatHistoryRepository;
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
public class ChatbotService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final UserRepository userRepository;
    private final GeminiClient geminiClient;

    @Transactional
    public ChatResponse sendMessage(ChatRequest request, UUID userId) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        ChatHistory userMessage = ChatHistory.builder()
                .user(user)
                .messageRole("USER")
                .messageContent(request.getMessage())
                .sessionId(request.getSessionId())
                .build();
        chatHistoryRepository.save(userMessage);

        String aiResponse = generateResponse(request.getMessage());

        ChatHistory aiMessage = ChatHistory.builder()
                .user(user)
                .messageRole("ASSISTANT")
                .messageContent(aiResponse)
                .sessionId(request.getSessionId())
                .build();
        chatHistoryRepository.save(aiMessage);

        return ChatResponse.builder()
                .message(aiResponse)
                .sessionId(request.getSessionId())
                .build();
    }

    public List<ChatHistoryResponse> getChatHistory(UUID userId) {
        return chatHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteChatHistory(UUID userId) {
        chatHistoryRepository.deleteByUserId(userId);
    }

    private String generateResponse(String message) {
        if (geminiClient.isConfigured()) {
            try {
                return geminiClient.complete(GeminiClient.MEDICAL_SYSTEM_PROMPT, message);
            } catch (GeminiClient.GeminiException e) {
                // fall through to the safe offline reply
            }
        }
        return "I can't reach the assistant right now. For any medication or health question, "
             + "please consult your doctor or pharmacist — and seek emergency care for anything urgent.";
    }

    private ChatHistoryResponse mapToResponse(ChatHistory chat) {
        return ChatHistoryResponse.builder()
                .id(chat.getId())
                .messageRole(chat.getMessageRole())
                .messageContent(chat.getMessageContent())
                .sessionId(chat.getSessionId())
                .createdAt(chat.getCreatedAt())
                .build();
    }
}
