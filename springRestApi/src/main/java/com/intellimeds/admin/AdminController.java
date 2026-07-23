package com.intellimeds.admin;

import com.intellimeds.admin.dto.AdminUserResponse;
import com.intellimeds.admin.dto.DashboardResponse;
import com.intellimeds.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        List<AdminUserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable UUID id) {
        AdminUserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam Boolean active) {
        AdminUserResponse user = adminService.updateUserStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable UUID id,
            @RequestBody UserUpdateRequest request) {
        com.intellimeds.model.User user = com.intellimeds.model.User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .build();
        AdminUserResponse updatedUser = adminService.updateUser(id, user);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/reports/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", dashboard));
    }

    @lombok.Data
    public static class UserUpdateRequest {
        private String name;
        private String email;
    }
}
