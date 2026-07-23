package com.intellimeds.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryResponse {
    private UUID id;
    private String messageRole;
    private String messageContent;
    private String sessionId;
    private LocalDateTime createdAt;
}
