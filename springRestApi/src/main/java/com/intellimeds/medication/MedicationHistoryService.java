package com.intellimeds.medication;

import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.medication.dto.MedicationHistoryResponse;
import com.intellimeds.medication.model.MedicationHistory;
import com.intellimeds.medication.repository.MedicationHistoryRepository;
import com.intellimeds.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationHistoryService {

    private final MedicationHistoryRepository historyRepository;

    public List<MedicationHistoryResponse> getMedicationHistory(UUID userId) {
        return historyRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markMedication(UUID userId, UUID drugId, MedicationHistory.MedicationStatus status) {
        MedicationHistory history = MedicationHistory.builder()
                .user(User.builder().id(userId).build())
                .drug(com.intellimeds.drug.model.Drug.builder().id(drugId).build())
                .date(java.time.LocalDate.now())
                .status(status)
                .build();
        historyRepository.save(history);
    }

    private MedicationHistoryResponse mapToResponse(MedicationHistory history) {
        return MedicationHistoryResponse.builder()
                .id(history.getId())
                .drugId(history.getDrug().getId())
                .drugName(history.getDrug().getBrandName())
                .date(history.getDate())
                .status(history.getStatus().name())
                .dosage(history.getDosage())
                .notes(history.getNotes())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
