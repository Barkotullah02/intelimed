package com.intellimeds.doctor.repository;

import com.intellimeds.doctor.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {

    List<Doctor> findByVerifiedTrueAndAvailableTrue();

    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.hospital) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Doctor> searchByKeyword(@Param("keyword") String keyword);
}
