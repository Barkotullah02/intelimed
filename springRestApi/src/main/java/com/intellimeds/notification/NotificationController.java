package com.intellimeds.notification;

import com.intellimeds.dto.ApiResponse;
import com.intellimeds.model.User;
import com.intellimeds.notification.dto.NotificationResponse;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<NotificationResponse> notifications = notificationService.getNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable UUID id) {
        NotificationResponse notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.intellimeds.exception.ResourceNotFoundException(
                        "User", "email", authentication.getName()));
    }
}
