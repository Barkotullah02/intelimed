package com.intellimeds.doctor;

import com.intellimeds.doctor.dto.DoctorResponse;
import com.intellimeds.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        List<DoctorResponse> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable UUID id) {
        DoctorResponse doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved successfully", doctor));
    }

    @GetMapping("/verified")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getVerifiedDoctors() {
        List<DoctorResponse> doctors = doctorService.getVerifiedDoctors();
        return ResponseEntity.ok(ApiResponse.success("Verified doctors retrieved", doctors));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> searchDoctors(
            @RequestParam String keyword) {
        List<DoctorResponse> doctors = doctorService.searchDoctors(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results", doctors));
    }
}
