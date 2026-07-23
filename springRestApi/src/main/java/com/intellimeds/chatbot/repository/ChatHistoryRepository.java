package com.intellimeds.chatbot.repository;

import com.intellimeds.chatbot.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {
    List<ChatHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<ChatHistory> findByUserIdAndSessionIdOrderByCreatedAtAsc(UUID userId, String sessionId);
    void deleteByUserId(UUID userId);
}
