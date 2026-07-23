package com.intellimeds.drug.repository;

import com.intellimeds.drug.model.Drug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrugRepository extends JpaRepository<Drug, UUID> {

    @Query("SELECT d FROM Drug d WHERE d.isActive = true AND " +
           "(LOWER(d.genericName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.brandName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Drug> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT d FROM Drug d WHERE d.isActive = true AND " +
           "(LOWER(d.genericName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.brandName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY d.brandName ASC LIMIT 10")
    List<Drug> findSuggestions(@Param("keyword") String keyword);

    List<Drug> findByIsActiveTrue();

    List<Drug> findByCategoryId(UUID categoryId);
}
