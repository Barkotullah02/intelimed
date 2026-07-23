package com.intellimeds.interaction.model;

import com.intellimeds.drug.model.Drug;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "drug_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_a_id", nullable = false)
    private Drug drugA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_b_id", nullable = false)
    private Drug drugB;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Severity {
        MAJOR,
        MODERATE,
        MINOR
    }
}
