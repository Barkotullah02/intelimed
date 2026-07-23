package com.intellimeds.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String address;
    private Double weight;
    private Double height;
    private String allergies;
    private String chronicDiseases;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bloodGroup;
    private String specialization;
    private String licenseNumber;
    private String hospital;
}
