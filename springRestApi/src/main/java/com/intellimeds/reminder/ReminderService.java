package com.intellimeds.reminder;

import com.intellimeds.drug.model.Drug;
import com.intellimeds.drug.repository.DrugRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import com.intellimeds.reminder.dto.CreateReminderRequest;
import com.intellimeds.reminder.dto.ReminderResponse;
import com.intellimeds.reminder.model.MedicationReminder;
import com.intellimeds.reminder.repository.MedicationReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final MedicationReminderRepository reminderRepository;
    private final DrugRepository drugRepository;

    public List<ReminderResponse> getReminders(UUID userId) {
        return reminderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReminderResponse getReminderById(UUID id) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", id));
        return mapToResponse(reminder);
    }

    @Transactional
    public ReminderResponse createReminder(CreateReminderRequest request, User user) {
        Drug drug = drugRepository.findById(request.getDrugId())
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", request.getDrugId()));

        MedicationReminder reminder = MedicationReminder.builder()
                .user(user)
                .drug(drug)
                .reminderTime(request.getReminderTime())
                .frequency(request.getFrequency())
                .dosage(request.getDosage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notificationEnabled(request.getNotificationEnabled() != null ?
                        request.getNotificationEnabled() : true)
                .isActive(true)
                .build();

        reminderRepository.save(reminder);
        return mapToResponse(reminder);
    }

    @Transactional
    public ReminderResponse updateReminder(UUID id, CreateReminderRequest request) {
        MedicationReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", id));

        Drug drug = drugRepository.findById(request.getDrugId())
                .orElseThrow(() -> new ResourceNotFoundException("Drug", "id", request.getDrugId()));

        reminder.setDrug(drug);
        reminder.setReminderTime(request.getReminderTime());
        reminder.setFrequency(request.getFrequency());
        reminder.setDosage(request.getDosage());
        reminder.setStartDate(request.getStartDate());
        reminder.setEndDate(request.getEndDate());
        if (request.getNotificationEnabled() != null) {
            reminder.setNotificationEnabled(request.getNotificationEnabled());
        }

        reminderRepository.save(reminder);
        return mapToResponse(reminder);
    }

    @Transactional
    public void deleteReminder(UUID id) {
        if (!reminderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Reminder", "id", id);
        }
        reminderRepository.deleteById(id);
    }

    private ReminderResponse mapToResponse(MedicationReminder reminder) {
        return ReminderResponse.builder()
                .id(reminder.getId())
                .drugId(reminder.getDrug().getId())
                .drugName(reminder.getDrug().getBrandName())
                .reminderTime(reminder.getReminderTime())
                .frequency(reminder.getFrequency())
                .dosage(reminder.getDosage())
                .startDate(reminder.getStartDate())
                .endDate(reminder.getEndDate())
                .notificationEnabled(reminder.getNotificationEnabled())
                .isActive(reminder.getIsActive())
                .createdAt(reminder.getCreatedAt())
                .build();
    }
}
