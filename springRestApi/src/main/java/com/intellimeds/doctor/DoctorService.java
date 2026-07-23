package com.intellimeds.doctor;

import com.intellimeds.doctor.dto.DoctorResponse;
import com.intellimeds.doctor.model.Doctor;
import com.intellimeds.doctor.repository.DoctorRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

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
                .available(doctor.getAvailable())
                .profileImage(doctor.getProfile().getProfileImage())
                .build();
    }
}
