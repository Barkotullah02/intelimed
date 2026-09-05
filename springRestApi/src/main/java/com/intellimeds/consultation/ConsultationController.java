package com.intellimeds.consultation;

import com.intellimeds.consultation.dto.ConsultationResponse;
import com.intellimeds.consultation.dto.CreateConsultationRequest;
import com.intellimeds.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ConsultationResponse>> create(
            @RequestBody CreateConsultationRequest request, Authentication auth) {
        ConsultationResponse res = consultationService.create(request, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Consultation created", res));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ConsultationResponse>>> mine(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Consultations retrieved",
                consultationService.listMine(auth.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConsultationResponse>> get(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Consultation retrieved",
                consultationService.get(id, auth.getName())));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ConsultationResponse>> join(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Joined consultation",
                consultationService.join(id, auth.getName())));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<ApiResponse<ConsultationResponse>> end(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Consultation ended",
                consultationService.end(id, auth.getName())));
    }
}
