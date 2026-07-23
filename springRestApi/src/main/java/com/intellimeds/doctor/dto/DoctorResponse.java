package com.intellimeds.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private UUID id;
    private String fullName;
    private String specialization;
    private String licenseNumber;
    private String hospital;
    private Integer experienceYears;
    private Double consultationFee;
    private String bio;
    private Boolean verified;
    private Boolean available;
    private String profileImage;
}
