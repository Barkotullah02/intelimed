package com.intellimeds.prescription;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellimeds.consultation.model.ConsultationSession;
import com.intellimeds.consultation.repository.ConsultationSessionRepository;
import com.intellimeds.exception.ResourceNotFoundException;
import com.intellimeds.model.User;
import com.intellimeds.prescription.dto.PrescriptionItem;
import com.intellimeds.prescription.dto.PrescriptionResponse;
import com.intellimeds.prescription.dto.SavePrescriptionRequest;
import com.intellimeds.prescription.model.Prescription;
import com.intellimeds.prescription.repository.PrescriptionRepository;
import com.intellimeds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationSessionRepository consultationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /** Doctor creates or updates the prescription for a consultation they are the doctor on. */
    @Transactional
    public PrescriptionResponse save(UUID consultationId, SavePrescriptionRequest request, String callerEmail) {
        User caller = requireUser(callerEmail);
        ConsultationSession consult = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", consultationId));

        UUID doctorUserId = consult.getDoctor().getProfile().getUser().getId();
        if (!doctorUserId.equals(caller.getId())) {
            throw new AccessDeniedException("Only the consulting doctor can write a prescription");
        }

        Prescription prescription = prescriptionRepository.findByConsultationId(consultationId)
                .orElseGet(Prescription::new);
        prescription.setConsultation(consult);
        prescription.setPatient(consult.getPatient());
        prescription.setDoctor(consult.getDoctor());
        prescription.setAdvice(request.getAdvice());
        prescription.setItemsJson(writeItems(request.getItems()));

        return mapToResponse(prescriptionRepository.save(prescription));
    }

    /** Either participant of the consultation can read its prescription (null if none yet). */
    @Transactional(readOnly = true)
    public PrescriptionResponse get(UUID consultationId, String callerEmail) {
        User caller = requireUser(callerEmail);
        ConsultationSession consult = consultationRepository.findById(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", consultationId));

        boolean isPatient = consult.getPatient().getId().equals(caller.getId());
        boolean isDoctor = consult.getDoctor().getProfile().getUser().getId().equals(caller.getId());
        if (!isPatient && !isDoctor) {
            throw new AccessDeniedException("You are not a participant of this consultation");
        }
        return prescriptionRepository.findByConsultationId(consultationId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    /** All prescriptions written for the signed-in patient, newest first. */
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listForPatient(String callerEmail) {
        User caller = requireUser(callerEmail);
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(caller.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ---- helpers -------------------------------------------------------------

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private String writeItems(List<PrescriptionItem> items) {
        try {
            return objectMapper.writeValueAsString(items == null ? Collections.emptyList() : items);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid prescription items");
        }
    }

    private List<PrescriptionItem> readItems(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<PrescriptionItem>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private PrescriptionResponse mapToResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .appointmentId(p.getConsultation().getAppointment() != null
                        ? p.getConsultation().getAppointment().getId() : null)
                .doctorName(p.getDoctor().getProfile().getFullName())
                .patientName(p.getPatient().getName())
                .advice(p.getAdvice())
                .items(readItems(p.getItemsJson()))
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
