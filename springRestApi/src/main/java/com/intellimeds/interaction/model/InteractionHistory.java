package com.intellimeds.interaction.model;

import com.intellimeds.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interaction_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteractionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "drug_ids", columnDefinition = "TEXT")
    private String drugIds;

    @Column(name = "result_summary", columnDefinition = "TEXT")
    private String resultSummary;

    @Column(name = "highest_severity")
    private String highestSeverity;

    @CreationTimestamp
    @Column(name = "checked_at", updatable = false)
    private LocalDateTime checkedAt;
}
