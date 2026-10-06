package com.whisperledger.service;

import com.whisperledger.dto.ComplaintDtos.*;
import com.whisperledger.entity.*;
import com.whisperledger.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintSupportRepository supportRepository;
    private final ComplaintMessageRepository messageRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final EscalationLogRepository escalationLogRepository;

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest req, String anonymousId, Long userId) {
        Complaint complaint = Complaint.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory() != null ? req.getCategory().toUpperCase() : "OTHER")
                .department(req.getDepartment())
                .year(req.getYear() != null ? req.getYear() : 1)
                .status("SUBMITTED")
                .priority(req.getPriority() != null ? req.getPriority().toUpperCase() : "MEDIUM")
                .anonymousId(anonymousId)
                .supportCount(1) // Creator counts as initial supporter
                .build();

        Complaint saved = complaintRepository.save(complaint);

        // Record initial status history
        historyRepository.save(ComplaintStatusHistory.builder()
                .complaintId(saved.getId())
                .oldStatus("NONE")
                .newStatus("SUBMITTED")
                .remarks("Anonymous complaint registered into ledger")
                .build());

        // Support record for creator
        supportRepository.save(ComplaintSupport.builder()
                .complaintId(saved.getId())
                .supporterId(userId)
                .build());

        return toDto(saved, userId);
    }

    public List<ComplaintResponse> getAllComplaints(Long currentUserId) {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(c -> toDto(c, currentUserId))
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getMyComplaints(String anonymousId, Long currentUserId) {
        return complaintRepository.findByAnonymousIdOrderByCreatedAtDesc(anonymousId)
                .stream()
                .map(c -> toDto(c, currentUserId))
                .collect(Collectors.toList());
    }

    public ComplaintResponse getComplaintById(Long id, Long currentUserId) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        return toDto(complaint, currentUserId);
    }

    @Transactional
    public ComplaintResponse toggleSupport(Long complaintId, Long supporterId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (supportRepository.existsByComplaintIdAndSupporterId(complaintId, supporterId)) {
            // Already supported
            return toDto(complaint, supporterId);
        }

        supportRepository.save(ComplaintSupport.builder()
                .complaintId(complaintId)
                .supporterId(supporterId)
                .build());

        complaint.setSupportCount(complaint.getSupportCount() + 1);
        complaintRepository.save(complaint);

        return toDto(complaint, supporterId);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long complaintId, String newStatus, String remarks, String updatedByRole) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String oldStatus = complaint.getStatus();
        complaint.setStatus(newStatus.toUpperCase());
        complaintRepository.save(complaint);

        historyRepository.save(ComplaintStatusHistory.builder()
                .complaintId(complaintId)
                .oldStatus(oldStatus)
                .newStatus(newStatus.toUpperCase())
                .remarks(remarks != null ? remarks : "Status updated by " + updatedByRole)
                .build());

        return toDto(complaint, null);
    }

    public List<ComplaintMessage> getMessages(Long complaintId) {
        return messageRepository.findByComplaintIdOrderByCreatedAtAsc(complaintId);
    }

    @Transactional
    public ComplaintMessage sendMessage(Long complaintId, String senderRole, String message) {
        ComplaintMessage msg = ComplaintMessage.builder()
                .complaintId(complaintId)
                .senderRole(senderRole)
                .message(message)
                .build();
        return messageRepository.save(msg);
    }

    public ComplaintResponse toDto(Complaint c, Long currentUserId) {
        boolean hasSupported = false;
        if (currentUserId != null) {
            hasSupported = supportRepository.existsByComplaintIdAndSupporterId(c.getId(), currentUserId);
        }

        return ComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .department(c.getDepartment())
                .year(c.getYear())
                .status(c.getStatus())
                .priority(c.getPriority())
                .anonymousId(c.getAnonymousId())
                .supportCount(c.getSupportCount())
                .hasSupported(hasSupported)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .statusHistory(historyRepository.findByComplaintIdOrderByUpdatedAtAsc(c.getId()))
                .messages(messageRepository.findByComplaintIdOrderByCreatedAtAsc(c.getId()))
                .escalationLogs(escalationLogRepository.findByComplaintIdOrderByTimestampAsc(c.getId()))
                .build();
    }
}
