package com.intellimeds.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Long totalUsers;
    private Long activeUsers;
    private Long totalDrugs;
    private Long totalInteractions;
    private Long totalAppointments;
    private Long totalAiRequests;
    private Map<String, Long> dailyRequests;
    private Map<String, Long> monthlyRequests;
}
