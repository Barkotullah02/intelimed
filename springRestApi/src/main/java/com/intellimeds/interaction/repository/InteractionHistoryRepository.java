package com.intellimeds.interaction.repository;

import com.intellimeds.interaction.model.InteractionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InteractionHistoryRepository extends JpaRepository<InteractionHistory, UUID> {
    List<InteractionHistory> findByUserIdOrderByCheckedAtDesc(UUID userId);
}
