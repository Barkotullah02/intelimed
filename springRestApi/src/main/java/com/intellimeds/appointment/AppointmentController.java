package com.intellimeds.appointment;

import com.intellimeds.appointment.dto.AppointmentResponse;
import com.intellimeds.appointment.dto.CreateAppointmentRequest;
import com.intellimeds.appointment.model.Appointment;
import com.intellimeds.dto.ApiResponse;
import com.intellimeds.model.User;
import com.intellimeds.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments(
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<AppointmentResponse> appointments = appointmentService.getPatientAppointments(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved successfully", appointments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(
            @PathVariable UUID id) {
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved successfully", appointment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        AppointmentResponse appointment = appointmentService.createAppointment(request, user);
        return ResponseEntity.ok(ApiResponse.success("Appointment created successfully", appointment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable UUID id,
            @RequestParam Appointment.AppointmentStatus status) {
        AppointmentResponse appointment = appointmentService.updateAppointment(id, status);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", appointment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable UUID id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }

    private User getUserFromAuth(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new com.intellimeds.exception.ResourceNotFoundException(
                        "User", "email", authentication.getName()));
    }
}
