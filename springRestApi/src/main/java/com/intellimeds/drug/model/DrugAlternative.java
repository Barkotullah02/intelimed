package com.intellimeds.drug.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "drug_alternatives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugAlternative {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_id", nullable = false)
    private Drug drug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alternative_drug_id", nullable = false)
    private Drug alternativeDrug;

    @Column(name = "alternative_type")
    private String alternativeType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
