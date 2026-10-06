package com.whisperledger.service;

import com.whisperledger.entity.Complaint;
import com.whisperledger.entity.ComplaintStatusHistory;
import com.whisperledger.entity.EscalationLog;
import com.whisperledger.repository.ComplaintRepository;
import com.whisperledger.repository.ComplaintStatusHistoryRepository;
import com.whisperledger.repository.EscalationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscalationService {

    private final ComplaintRepository complaintRepository;
    private final EscalationLogRepository escalationLogRepository;
    private final ComplaintStatusHistoryRepository historyRepository;

    // Evaluates complaints: Pending > 7 days -> HOD, > 14 days -> Dean, > 21 days -> Grievance Committee
    @Scheduled(cron = "0 0 1 * * ?") // Runs every day at 1:00 AM
    @Transactional
    public int checkAndEscalateComplaints() {
        List<Complaint> unresolved = complaintRepository.findAllByOrderByCreatedAtDesc();
        LocalDateTime now = LocalDateTime.now();
        int count = 0;

        for (Complaint complaint : unresolved) {
            if ("RESOLVED".equalsIgnoreCase(complaint.getStatus()) || "CLOSED".equalsIgnoreCase(complaint.getStatus())) {
                continue;
            }

            long daysPending = Duration.between(complaint.getCreatedAt(), now).toDays();
            List<EscalationLog> logs = escalationLogRepository.findByComplaintIdOrderByTimestampAsc(complaint.getId());

            boolean hasHodEscalation = logs.stream().anyMatch(l -> "LEVEL_1_HOD".equals(l.getCurrentLevel()));
            boolean hasDeanEscalation = logs.stream().anyMatch(l -> "LEVEL_2_DEAN".equals(l.getCurrentLevel()));
            boolean hasCommitteeEscalation = logs.stream().anyMatch(l -> "LEVEL_3_COMMITTEE".equals(l.getCurrentLevel()));

            if (daysPending >= 21 && !hasCommitteeEscalation) {
                escalate(complaint, "LEVEL_3_COMMITTEE", "Grievance Committee", "Pending > 21 Days without final resolution");
                count++;
            } else if (daysPending >= 14 && !hasDeanEscalation) {
                escalate(complaint, "LEVEL_2_DEAN", "Dean of Student Affairs", "Pending > 14 Days without resolution by HOD");
                count++;
            } else if (daysPending >= 7 && !hasHodEscalation) {
                escalate(complaint, "LEVEL_1_HOD", "Head of Department (" + complaint.getDepartment() + ")", "Pending > 7 Days without initial action");
                count++;
            }
        }

        return count;
    }

    // Manual test trigger for Hackathon evaluators to test escalation rules immediately
    @Transactional
    public EscalationLog triggerManualEscalation(Long complaintId, String targetRole, String reason) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        return escalate(complaint, "MANUAL_" + targetRole, targetRole, reason);
    }

    private EscalationLog escalate(Complaint complaint, String level, String escalatedTo, String reason) {
        String oldStatus = complaint.getStatus();
        complaint.setStatus("ESCALATED");
        complaint.setPriority("HIGH");
        complaintRepository.save(complaint);

        historyRepository.save(ComplaintStatusHistory.builder()
                .complaintId(complaint.getId())
                .oldStatus(oldStatus)
                .newStatus("ESCALATED")
                .remarks("System auto-escalation triggered: " + reason)
                .build());

        EscalationLog logEntry = EscalationLog.builder()
                .complaintId(complaint.getId())
                .currentLevel(level)
                .escalatedTo(escalatedTo)
                .reason(reason)
                .build();

        return escalationLogRepository.save(logEntry);
    }
}
