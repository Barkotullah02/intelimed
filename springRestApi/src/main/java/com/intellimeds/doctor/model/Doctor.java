package com.intellimeds.doctor.model;

import com.intellimeds.model.Profile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "specialization", nullable = false)
    private String specialization;

    @Column(name = "license_number", unique = true)
    private String licenseNumber;

    @Column(name = "hospital")
    private String hospital;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "available")
    @Builder.Default
    private Boolean available = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
