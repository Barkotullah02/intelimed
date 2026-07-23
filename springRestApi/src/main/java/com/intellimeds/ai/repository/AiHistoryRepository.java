package com.intellimeds.ai.repository;

import com.intellimeds.ai.model.AiHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiHistoryRepository extends JpaRepository<AiHistory, UUID> {
    List<AiHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
