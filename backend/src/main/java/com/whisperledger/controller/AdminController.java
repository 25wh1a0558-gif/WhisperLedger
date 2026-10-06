package com.whisperledger.controller;

import com.whisperledger.dto.ComplaintDtos.*;
import com.whisperledger.entity.EscalationLog;
import com.whisperledger.entity.SystemAlert;
import com.whisperledger.repository.ComplaintRepository;
import com.whisperledger.repository.EscalationLogRepository;
import com.whisperledger.repository.SystemAlertRepository;
import com.whisperledger.service.AiClusteringService;
import com.whisperledger.service.EscalationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintRepository complaintRepository;
    private final EscalationLogRepository escalationLogRepository;
    private final SystemAlertRepository alertRepository;
    private final EscalationService escalationService;
    private final AiClusteringService aiClusteringService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long total = complaintRepository.count();
        long open = complaintRepository.findByStatusOrderByCreatedAtDesc("SUBMITTED").size();
        long underReview = complaintRepository.findByStatusOrderByCreatedAtDesc("UNDER_REVIEW").size() +
                           complaintRepository.findByStatusOrderByCreatedAtDesc("IN_PROGRESS").size();
        long escalated = complaintRepository.findByStatusOrderByCreatedAtDesc("ESCALATED").size();
        long resolved = complaintRepository.findByStatusOrderByCreatedAtDesc("RESOLVED").size() +
                        complaintRepository.findByStatusOrderByCreatedAtDesc("CLOSED").size();

        double resolutionRate = total > 0 ? ((double) resolved / total) * 100.0 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalComplaints", total);
        stats.put("openComplaints", open);
        stats.put("underReviewComplaints", underReview);
        stats.put("escalatedComplaints", escalated);
        stats.put("resolvedComplaints", resolved);
        stats.put("resolutionRate", Math.round(resolutionRate * 10.0) / 10.0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/escalations")
    public ResponseEntity<List<EscalationLog>> getEscalationLogs() {
        return ResponseEntity.ok(escalationLogRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/escalation/trigger")
    public ResponseEntity<Map<String, Object>> runEscalationCycle() {
        int escalatedCount = escalationService.checkAndEscalateComplaints();
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Escalation evaluation completed");
        res.put("escalatedCount", escalatedCount);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<SystemAlert>> getSystemAlerts() {
        return ResponseEntity.ok(alertRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/alerts/cluster")
    public ResponseEntity<List<SystemAlert>> runAiClustering() {
        return ResponseEntity.ok(aiClusteringService.clusterAndGenerateAlerts());
    }
}
