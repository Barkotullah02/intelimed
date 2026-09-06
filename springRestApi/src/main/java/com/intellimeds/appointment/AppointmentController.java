package com.intellimeds.appointment;

import com.intellimeds.appointment.dto.AppointmentResponse;
import com.intellimeds.appointment.dto.CreateAppointmentRequest;
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

    @GetMapping("/doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments(
            Authentication authentication) {
        User user = getUserFromAuth(authentication);
        List<AppointmentResponse> appointments = appointmentService.getDoctorAppointmentsForUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved", appointments));
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

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<AppointmentResponse>> acceptAppointment(
            @PathVariable UUID id, Authentication authentication) {
        AppointmentResponse appointment = appointmentService.accept(id, getUserFromAuth(authentication));
        return ResponseEntity.ok(ApiResponse.success("Appointment accepted", appointment));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<ApiResponse<AppointmentResponse>> declineAppointment(
            @PathVariable UUID id, Authentication authentication) {
        AppointmentResponse appointment = appointmentService.decline(id, getUserFromAuth(authentication));
        return ResponseEntity.ok(ApiResponse.success("Appointment declined", appointment));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable UUID id, Authentication authentication) {
        AppointmentResponse appointment = appointmentService.cancel(id, getUserFromAuth(authentication));
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointment));
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
