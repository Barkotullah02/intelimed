package com.intellimeds.reminder.repository;

import com.intellimeds.reminder.model.MedicationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, UUID> {
    List<MedicationReminder> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<MedicationReminder> findByUserIdAndIsActiveTrue(UUID userId);
}
