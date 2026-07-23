package com.intellimeds.medication.model;

import com.intellimeds.drug.model.Drug;
import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medication_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_id", nullable = false)
    private Drug drug;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private MedicationStatus status;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum MedicationStatus {
        COMPLETED,
        MISSED,
        SKIPPED,
        PARTIAL
    }
}
