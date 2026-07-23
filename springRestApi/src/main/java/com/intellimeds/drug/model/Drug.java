package com.intellimeds.drug.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "drugs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drug {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "generic_name", nullable = false)
    private String genericName;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "manufacturer_name")
    private String manufacturerName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String uses;

    @Column(name = "dosage_form")
    private String dosageForm;

    @Column(columnDefinition = "TEXT")
    private String dosage;

    @Column(name = "side_effects", columnDefinition = "TEXT")
    private String sideEffects;

    @Column(name = "contraindications", columnDefinition = "TEXT")
    private String contraindications;

    @Column(name = "pregnancy_safety")
    private String pregnancySafety;

    @Column(columnDefinition = "TEXT")
    private String storage;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private DrugCategory category;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
