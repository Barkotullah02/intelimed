package com.intellimeds.admin;

import com.intellimeds.doctor.dto.DoctorResponse;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.doctor.repository.DoctorRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin — review and decide on doctor verification applications.
 */
@Service
@RequiredArgsConstructor
public class AdminDoctorService {

    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<DoctorResponse> list(String status) {
        List<Doctor> doctors = (status == null || status.isBlank())
                ? doctorRepository.findAll()
                : doctorRepository.findByVerificationStatus(parseStatus(status));
        return doctors.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorResponse getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public DoctorResponse decide(UUID id, String status, String rejectionReason) {
        Doctor doctor = findOrThrow(id);
        Doctor.VerificationStatus decision = parseStatus(status);
        if (decision == Doctor.VerificationStatus.PENDING) {
            throw new IllegalArgumentException("Decision must be APPROVED or REJECTED");
        }
        doctor.setVerificationStatus(decision);
        if (decision == Doctor.VerificationStatus.APPROVED) {
            doctor.setVerified(true);
            doctor.setRejectionReason(null);
        } else {
            doctor.setVerified(false);
            doctor.setRejectionReason(rejectionReason);
        }
        return toResponse(doctorRepository.save(doctor));
    }

    private Doctor findOrThrow(UUID id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
    }

    private Doctor.VerificationStatus parseStatus(String value) {
        try {
            return Doctor.VerificationStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status '" + value + "'. Allowed: PENDING, APPROVED, REJECTED");
        }
    }

    private DoctorResponse toResponse(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getProfile().getFullName())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .hospital(doctor.getHospital())
                .experienceYears(doctor.getExperienceYears())
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .verified(doctor.getVerified())
                .verificationStatus(doctor.getVerificationStatus().name())
                .rejectionReason(doctor.getRejectionReason())
                .available(doctor.getAvailable())
                .profileImage(doctor.getProfile().getProfileImage())
                .build();
    }
}
