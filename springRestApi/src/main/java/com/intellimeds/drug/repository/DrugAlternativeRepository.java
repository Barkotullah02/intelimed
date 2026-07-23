package com.intellimeds.drug.repository;

import com.intellimeds.drug.model.DrugAlternative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrugAlternativeRepository extends JpaRepository<DrugAlternative, UUID> {
    List<DrugAlternative> findByDrugId(UUID drugId);
}
