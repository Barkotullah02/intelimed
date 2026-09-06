package com.intellimeds.prescription;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.prescription.dto.PrescriptionResponse;
import com.intellimeds.prescription.dto.SavePrescriptionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    /** Doctor writes/updates the prescription for a consultation. */
    @PutMapping("/consultations/{consultationId}/prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> save(
            @PathVariable UUID consultationId,
            @RequestBody SavePrescriptionRequest request,
            Authentication auth) {
        PrescriptionResponse res = prescriptionService.save(consultationId, request, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Prescription saved", res));
    }

    /** Either participant reads the consultation's prescription (data is null if none yet). */
    @GetMapping("/consultations/{consultationId}/prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> get(
            @PathVariable UUID consultationId, Authentication auth) {
        PrescriptionResponse res = prescriptionService.get(consultationId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Prescription retrieved", res));
    }

    /** Patient lists all prescriptions written for them. */
    @GetMapping("/prescriptions/mine")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> mine(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Prescriptions retrieved",
                prescriptionService.listForPatient(auth.getName())));
    }
}
