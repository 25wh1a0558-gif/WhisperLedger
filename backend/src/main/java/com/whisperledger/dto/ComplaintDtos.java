package com.whisperledger.dto;

import com.whisperledger.entity.ComplaintMessage;
import com.whisperledger.entity.ComplaintStatusHistory;
import com.whisperledger.entity.EscalationLog;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class ComplaintDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateComplaintRequest {
        private String title;
        private String description;
        private String category;
        private String department;
        private Integer year;
        private String priority;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComplaintResponse {
        private Long id;
        private String title;
        private String description;
        private String category;
        private String department;
        private Integer year;
        private String status;
        private String priority;
        private String anonymousId;
        private Integer supportCount;
        private Boolean hasSupported;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<ComplaintStatusHistory> statusHistory;
        private List<ComplaintMessage> messages;
        private List<EscalationLog> escalationLogs;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateStatusRequest {
        private String status; // UNDER_REVIEW, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendMessageRequest {
        private Long complaintId;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardSummaryResponse {
        private Long totalComplaints;
        private Long openComplaints;
        private Long underReviewComplaints;
        private Long escalatedComplaints;
        private Long resolvedComplaints;
        private Double resolutionRate;
    }
}
