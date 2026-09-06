package com.intellimeds.consultation;

import com.intellimeds.consultation.dto.ConsultationResponse;
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

    /**
     * Open (or rejoin) the call for a CONFIRMED appointment once it is time. This replaces the
     * old ad-hoc "call a doctor now" endpoint — a consultation can only come from an accepted booking.
     */
    @PostMapping("/appointments/{appointmentId}/join")
    public ResponseEntity<ApiResponse<ConsultationResponse>> joinByAppointment(
            @PathVariable UUID appointmentId, Authentication auth) {
        ConsultationResponse res = consultationService.startFromAppointment(appointmentId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Consultation ready", res));
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
