package com.intellimeds.interaction.repository;

import com.intellimeds.interaction.model.DrugInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, UUID> {

    @Query("SELECT di FROM DrugInteraction di WHERE " +
           "(di.drugA.id IN :drugIds OR di.drugB.id IN :drugIds)")
    List<DrugInteraction> findByDrugIds(@Param("drugIds") List<UUID> drugIds);

    @Query("SELECT di FROM DrugInteraction di WHERE " +
           "(di.drugA.id = :drugId AND di.drugB.id = :drugId2) OR " +
           "(di.drugA.id = :drugId2 AND di.drugB.id = :drugId)")
    DrugInteraction findInteractionBetweenDrugs(@Param("drugId") UUID drugId, @Param("drugId2") UUID drugId2);
}
