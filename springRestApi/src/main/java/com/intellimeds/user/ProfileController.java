package com.intellimeds.user;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.user.dto.ProfileResponse;
import com.intellimeds.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.intellimeds.repository.UserRepository;
import com.intellimeds.model.User;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        ProfileResponse response = profileService.getProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = getUserFromAuth(authentication);
        ProfileResponse response = profileService.updateProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PatchMapping("/profile/image")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfileImage(
            Authentication authentication,
            @RequestBody java.util.Map<String, String> request) {
        User user = getUserFromAuth(authentication);
        ProfileResponse response = profileService.updateProfileImage(user.getId(), request.get("imageUrl"));
        return ResponseEntity.ok(ApiResponse.success("Profile image updated successfully", response));
    }

    @DeleteMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        profileService.deleteProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile deleted successfully", null));
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.intellimeds.exception.ResourceNotFoundException(
                        "User", "email", authentication.getName()));
    }
}
