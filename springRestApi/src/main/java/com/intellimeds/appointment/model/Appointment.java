package com.intellimeds.appointment.model;

import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.PENDING;

    /** Requested consultation modality for this booking. */
    @Column(name = "call_type")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CallType callType = CallType.VIDEO;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AppointmentStatus {
        PENDING,    // patient booked, awaiting the doctor's decision
        CONFIRMED,  // doctor accepted — joinable at the scheduled time
        DECLINED,   // doctor declined the request
        CANCELLED,  // cancelled by patient (or doctor) before it happened
        COMPLETED,  // the consultation took place
        NO_SHOW
    }

    public enum CallType { VIDEO, AUDIO }
}
