package com.intellimeds.prescription.model;

import com.intellimeds.consultation.model.ConsultationSession;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A prescription written by a doctor for one consultation. There is at most one per
 * consultation (the doctor edits it live during the call). Medicine lines are stored as
 * a JSON array in {@code itemsJson} to keep the schema simple; the service parses them.
 */
@Entity
@Table(name = "prescriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false, unique = true)
    private ConsultationSession consultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /** Free-text advice / notes for the patient. */
    @Column(name = "advice", columnDefinition = "TEXT")
    private String advice;

    /** JSON array of medicine lines: [{medicine,dosage,frequency,duration,instructions}]. */
    @Column(name = "items_json", columnDefinition = "TEXT")
    private String itemsJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
