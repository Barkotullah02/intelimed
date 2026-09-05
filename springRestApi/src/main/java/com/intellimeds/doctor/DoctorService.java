package com.intellimeds.doctor;

import com.intellimeds.doctor.dto.DoctorResponse;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.doctor.repository.DoctorRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

// Reads are transactional so the lazily-loaded Doctor.profile initializes
// while the persistence session is still open (open-in-view is disabled).
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public DoctorResponse getMyApplication(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Doctor doctor = doctorRepository.findByProfileUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor application", "user", email));
        return mapToResponse(doctor);
    }

    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DoctorResponse getDoctorById(java.util.UUID id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return mapToResponse(doctor);
    }

    public List<DoctorResponse> getVerifiedDoctors() {
        return doctorRepository.findByVerifiedTrueAndAvailableTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<DoctorResponse> searchDoctors(String keyword) {
        return doctorRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DoctorResponse mapToResponse(Doctor doctor) {
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
