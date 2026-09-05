package com.intellimeds.consultation.model;

import com.intellimeds.appointment.model.Appointment;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A 1:1 tele-consultation between a patient and a doctor. Media flows peer-to-peer
 * over WebRTC; this row only tracks the room + lifecycle so both sides can find and
 * join the same call and so the history is auditable.
 */
@Entity
@Table(name = "consultation_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsultationSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Short shared code both participants use to reach the same signaling room. */
    @Column(name = "room_code", nullable = false, unique = true, length = 32)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    /** Optional link to the appointment this call fulfils. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "call_type", nullable = false)
    @Builder.Default
    private CallType callType = CallType.VIDEO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Status status = Status.SCHEDULED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    public enum CallType { VIDEO, AUDIO }

    public enum Status { SCHEDULED, ACTIVE, ENDED, CANCELLED }
}
