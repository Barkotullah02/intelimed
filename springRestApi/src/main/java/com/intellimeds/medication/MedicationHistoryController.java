package com.intellimeds.medication;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.medication.dto.MedicationHistoryResponse;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
public class MedicationHistoryController {

    private final MedicationHistoryService historyService;
    private final UserRepository userRepository;

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<MedicationHistoryResponse>>> getMedicationHistory(
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<MedicationHistoryResponse> history = historyService.getMedicationHistory(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Medication history retrieved successfully", history));
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.intellimeds.exception.ResourceNotFoundException(
                        "User", "email", authentication.getName()));
    }
}
