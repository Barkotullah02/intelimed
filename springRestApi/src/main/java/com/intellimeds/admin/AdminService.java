package com.intellimeds.admin;

import com.intellimeds.admin.dto.AdminUserResponse;
import com.intellimeds.admin.dto.DashboardResponse;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public AdminUserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserStatus(UUID id, Boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setIsActive(isActive);
        userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUser(UUID id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    public DashboardResponse getDashboardStats() {
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(User::getIsActive).count();

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalDrugs(0L)
                .totalInteractions(0L)
                .totalAppointments(0L)
                .totalAiRequests(0L)
                .dailyRequests(java.util.Map.of())
                .monthlyRequests(java.util.Map.of())
                .build();
    }

    private AdminUserResponse mapToUserResponse(User user) {
        String roleName = user.getRoles().iterator().next().getName().name();
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(roleName)
                .isActive(user.getIsActive())
                .isLocked(user.getIsLocked())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
