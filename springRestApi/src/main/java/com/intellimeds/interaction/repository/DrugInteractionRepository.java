package com.intellimeds.interaction.repository;

import com.intellimeds.interaction.model.DrugInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, UUID> {

    @Query("SELECT di FROM DrugInteraction di WHERE " +
           "LOWER(di.drugA.genericName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(di.drugA.brandName)   LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(di.drugB.genericName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(di.drugB.brandName)   LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<DrugInteraction> searchByDrugName(@Param("q") String q, Pageable pageable);

    /**
     * Interactions *between* the selected drugs — i.e. pairs where BOTH sides are in the
     * chosen set. (Using OR here would return every interaction that merely touches one of
     * the drugs, i.e. hundreds of irrelevant third-drug pairs.)
     */
    @Query("SELECT di FROM DrugInteraction di " +
           "JOIN FETCH di.drugA JOIN FETCH di.drugB " +
           "WHERE di.drugA.id IN :drugIds AND di.drugB.id IN :drugIds")
    List<DrugInteraction> findByDrugIds(@Param("drugIds") List<UUID> drugIds);

    /** Every interaction involving a single drug (for the drug-detail page). */
    @Query(value = "SELECT di FROM DrugInteraction di " +
           "JOIN FETCH di.drugA JOIN FETCH di.drugB " +
           "WHERE di.drugA.id = :drugId OR di.drugB.id = :drugId",
           countQuery = "SELECT COUNT(di) FROM DrugInteraction di WHERE di.drugA.id = :drugId OR di.drugB.id = :drugId")
    Page<DrugInteraction> findByDrugId(@Param("drugId") UUID drugId, Pageable pageable);

    @Query("SELECT di FROM DrugInteraction di WHERE " +
           "(di.drugA.id = :drugId AND di.drugB.id = :drugId2) OR " +
           "(di.drugA.id = :drugId2 AND di.drugB.id = :drugId)")
    DrugInteraction findInteractionBetweenDrugs(@Param("drugId") UUID drugId, @Param("drugId2") UUID drugId2);
}
