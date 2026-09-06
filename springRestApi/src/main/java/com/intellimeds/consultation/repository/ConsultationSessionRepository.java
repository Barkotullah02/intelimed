package com.intellimeds.consultation.repository;

import com.intellimeds.consultation.model.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsultationSessionRepository extends JpaRepository<ConsultationSession, UUID> {

    Optional<ConsultationSession> findByRoomCode(String roomCode);

    boolean existsByRoomCode(String roomCode);

    /** The call session backing a given appointment, if one has been created yet. */
    Optional<ConsultationSession> findByAppointmentId(UUID appointmentId);

    /** Every session the given user takes part in — either as the patient or as the doctor. */
    @Query("SELECT c FROM ConsultationSession c " +
           "WHERE c.patient.id = :userId OR c.doctor.profile.user.id = :userId " +
           "ORDER BY c.createdAt DESC")
    List<ConsultationSession> findAllForUser(@Param("userId") UUID userId);

    /** Lazy-safe participant check for the WebSocket handshake (runs outside a JPA session). */
    @Query("SELECT (COUNT(c) > 0) FROM ConsultationSession c " +
           "WHERE c.roomCode = :room AND c.status <> com.intellimeds.consultation.model.ConsultationSession.Status.ENDED " +
           "AND (c.patient.id = :userId OR c.doctor.profile.user.id = :userId)")
    boolean isActiveParticipant(@Param("room") String room, @Param("userId") UUID userId);
}
