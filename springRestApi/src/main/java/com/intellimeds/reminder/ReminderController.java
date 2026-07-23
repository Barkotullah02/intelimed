package com.intellimeds.reminder;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.model.User;
import com.intellimeds.reminder.dto.CreateReminderRequest;
import com.intellimeds.reminder.dto.ReminderResponse;
import com.intellimeds.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReminderResponse>>> getReminders(
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<ReminderResponse> reminders = reminderService.getReminders(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Reminders retrieved successfully", reminders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReminderResponse>> getReminderById(@PathVariable UUID id) {
        ReminderResponse reminder = reminderService.getReminderById(id);
        return ResponseEntity.ok(ApiResponse.success("Reminder retrieved successfully", reminder));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReminderResponse>> createReminder(
            @Valid @RequestBody CreateReminderRequest request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        ReminderResponse reminder = reminderService.createReminder(request, user);
        return ResponseEntity.ok(ApiResponse.success("Reminder created successfully", reminder));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReminderResponse>> updateReminder(
            @PathVariable UUID id,
            @Valid @RequestBody CreateReminderRequest request) {
        ReminderResponse reminder = reminderService.updateReminder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reminder updated successfully", reminder));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReminder(@PathVariable UUID id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.ok(ApiResponse.success("Reminder deleted successfully", null));
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.intellimeds.exception.ResourceNotFoundException(
                        "User", "email", authentication.getName()));
    }
}
