package com.intellimeds.consultation.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ConsultationResponse {
    private UUID id;
    private String roomCode;
    private String callType;
    private String status;

    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    /** Whether the authenticated caller is the doctor side of this call. */
    private boolean self_isDoctor;

    /** WebRTC connectivity + signaling info the client needs to place the call. */
    private String signalingUrl;
    private List<IceServer> iceServers;

    @Data
    @Builder
    public static class IceServer {
        private List<String> urls;
        private String username;
        private String credential;
    }
}
