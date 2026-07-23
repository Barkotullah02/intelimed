package com.intellimeds.ai.model;

import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "prompt", columnDefinition = "TEXT", nullable = false)
    private String prompt;

    @Column(name = "response", columnDefinition = "TEXT", nullable = false)
    private String response;

    @Column(name = "provider")
    private String provider;

    @Column(name = "request_type")
    private String requestType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
