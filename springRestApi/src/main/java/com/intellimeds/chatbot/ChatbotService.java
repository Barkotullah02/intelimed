package com.intellimeds.chatbot;

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
        String lowerMessage = message.toLowerCase();

        if (lowerMessage.contains("headache") || lowerMessage.contains("head pain")) {
            return "For headaches, consider:\n" +
                   "1. Rest in a quiet, dark room\n" +
                   "2. Apply a cold compress to your forehead\n" +
                   "3. Stay hydrated\n" +
                   "4. Over-the-counter pain relievers like ibuprofen or acetaminophen\n\n" +
                   "If headaches are severe or persistent, please consult a healthcare professional.";
        } else if (lowerMessage.contains("fever") || lowerMessage.contains("temperature")) {
            return "For fever management:\n" +
                   "1. Rest and stay hydrated\n" +
                   "2. Take acetaminophen or ibuprofen as directed\n" +
                   "3. Wear light clothing\n" +
                   "4. Use a lukewarm sponge bath\n\n" +
                   "Seek medical attention if fever exceeds 103°F (39.4°C) or lasts more than 3 days.";
        } else if (lowerMessage.contains("cold") || lowerMessage.contains("cough")) {
            return "For cold/cough symptoms:\n" +
                   "1. Get plenty of rest\n" +
                   "2. Drink warm fluids\n" +
                   "3. Use honey for cough (for adults and children over 1)\n" +
                   "4. Consider over-the-counter cough medicine\n\n" +
                   "See a doctor if symptoms worsen or persist beyond 10 days.";
        }

        return "Thank you for your message. I'm here to help with general health information. " +
               "Please describe your symptoms or health concerns, and I'll provide relevant information. " +
               "Remember, this is not a substitute for professional medical advice.";
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
