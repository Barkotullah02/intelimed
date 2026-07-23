package com.intellimeds.drug.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "drug_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrugCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
