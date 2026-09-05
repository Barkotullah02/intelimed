package com.intellimeds.admin;

import com.intellimeds.doctor.dto.DoctorResponse;
import com.intellimeds.dto.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin — Doctor verification queue. List applications, inspect one,
 * and approve/reject, per the doctor-verification workflow.
 */
@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDoctorController {

    private final AdminDoctorService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> list(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", service.list(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved", service.getById(id)));
    }

    @PatchMapping("/{id}/verification")
    public ResponseEntity<ApiResponse<DoctorResponse>> decide(
            @PathVariable UUID id,
            @RequestBody VerificationDecision decision) {
        DoctorResponse result = service.decide(id, decision.getStatus(), decision.getRejectionReason());
        return ResponseEntity.ok(ApiResponse.success("Verification updated", result));
    }

    @Data
    public static class VerificationDecision {
        private String status;          // APPROVED | REJECTED
        private String rejectionReason; // optional, used when REJECTED
    }
}
