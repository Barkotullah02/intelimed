package com.intellimeds.user;

import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.Profile;
import com.intellimeds.model.User;
import com.intellimeds.repository.ProfileRepository;
import com.intellimeds.repository.UserRepository;
import com.intellimeds.user.dto.ProfileResponse;
import com.intellimeds.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getProfile(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", userId));
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", userId));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getWeight() != null) profile.setWeight(request.getWeight());
        if (request.getHeight() != null) profile.setHeight(request.getHeight());
        if (request.getAllergies() != null) profile.setAllergies(request.getAllergies());
        if (request.getChronicDiseases() != null) profile.setChronicDiseases(request.getChronicDiseases());
        if (request.getEmergencyContactName() != null) profile.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getBloodGroup() != null) profile.setBloodGroup(request.getBloodGroup());
        if (request.getSpecialization() != null) profile.setSpecialization(request.getSpecialization());
        if (request.getLicenseNumber() != null) profile.setLicenseNumber(request.getLicenseNumber());
        if (request.getHospital() != null) profile.setHospital(request.getHospital());

        profileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfileImage(UUID userId, String imageUrl) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", userId));
        profile.setProfileImage(imageUrl);
        profileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public void deleteProfile(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "userId", userId));
        profileRepository.delete(profile);
    }

    @Transactional
    public Profile createProfile(User user) {
        Profile profile = Profile.builder()
                .user(user)
                .fullName(user.getName())
                .build();
        return profileRepository.save(profile);
    }

    private ProfileResponse mapToResponse(Profile profile) {
        return ProfileResponse.builder()
                .id(profile.getId().toString())
                .userId(profile.getUser().getId().toString())
                .fullName(profile.getFullName())
                .dateOfBirth(profile.getDateOfBirth())
                .gender(profile.getGender())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .profileImage(profile.getProfileImage())
                .weight(profile.getWeight())
                .height(profile.getHeight())
                .allergies(profile.getAllergies())
                .chronicDiseases(profile.getChronicDiseases())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactPhone(profile.getEmergencyContactPhone())
                .bloodGroup(profile.getBloodGroup())
                .specialization(profile.getSpecialization())
                .licenseNumber(profile.getLicenseNumber())
                .hospital(profile.getHospital())
                .verified(profile.getVerified())
                .build();
    }
}
