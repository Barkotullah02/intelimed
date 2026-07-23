package com.intellimeds.drug.repository;

import com.intellimeds.drug.model.DrugCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DrugCategoryRepository extends JpaRepository<DrugCategory, UUID> {
    Optional<DrugCategory> findByName(String name);
}
