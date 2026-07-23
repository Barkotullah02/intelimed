package com.intellimeds.medication.repository;

import com.intellimeds.medication.model.MedicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationHistoryRepository extends JpaRepository<MedicationHistory, UUID> {
    List<MedicationHistory> findByUserIdOrderByDateDesc(UUID userId);
}
