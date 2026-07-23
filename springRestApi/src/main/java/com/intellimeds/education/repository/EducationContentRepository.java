package com.intellimeds.education.repository;

import com.intellimeds.education.model.EducationContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EducationContentRepository extends JpaRepository<EducationContent, UUID> {
    List<EducationContent> findByIsPublishedTrue();
    List<EducationContent> findByCategory(String category);
}
