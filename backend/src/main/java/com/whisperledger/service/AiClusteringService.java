package com.whisperledger.service;

import com.whisperledger.entity.Complaint;
import com.whisperledger.entity.SystemAlert;
import com.whisperledger.repository.ComplaintRepository;
import com.whisperledger.repository.SystemAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiClusteringService {

    private final ComplaintRepository complaintRepository;
    private final SystemAlertRepository alertRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    // Detects similar complaints and clusters recurring problems
    public List<SystemAlert> clusterAndGenerateAlerts() {
        List<Complaint> complaints = complaintRepository.findAllByOrderByCreatedAtDesc();

        // Group complaints by keyword clusters (WiFi, Water, Hostels, Staircase, Harassment, Lab, Food)
        Map<String, List<Complaint>> clusters = new HashMap<>();

        for (Complaint c : complaints) {
            String text = (c.getTitle() + " " + c.getDescription()).toLowerCase();
            String clusterKey = "General";

            if (text.contains("wifi") || text.contains("internet") || text.contains("network")) {
                clusterKey = "Campus Connectivity";
            } else if (text.contains("water") || text.contains("tap") || text.contains("plumbing") || text.contains("mess") || text.contains("hostel")) {
                clusterKey = "Hostel Living Conditions";
            } else if (text.contains("ragging") || text.contains("bully") || text.contains("harass")) {
                clusterKey = "Campus Safety & Anti-Ragging";
            } else if (text.contains("lab") || text.contains("equipment") || text.contains("circuit") || text.contains("system")) {
                clusterKey = "Laboratory Infrastructure";
            } else if (text.contains("exam") || text.contains("evaluat") || text.contains("grade") || text.contains("faculty")) {
                clusterKey = "Academic & Faculty Relations";
            }

            clusters.computeIfAbsent(clusterKey, k -> new ArrayList<>()).add(c);
        }

        List<SystemAlert> newAlerts = new ArrayList<>();

        for (Map.Entry<String, List<Complaint>> entry : clusters.entrySet()) {
            if (entry.getValue().size() >= 2) { // Cluster threshold: 2 or more related issues
                String title = "Recurring Issue Detected: " + entry.getKey();
                String desc = entry.getValue().size() + " anonymous reports received regarding " + entry.getKey() + 
                             ". Root cause pattern identified across " + entry.getValue().get(0).getDepartment() + " and associated facilities.";
                
                String severity = entry.getKey().contains("Safety") ? "CRITICAL" : 
                                 entry.getValue().size() > 4 ? "WARNING" : "INFO";

                SystemAlert alert = SystemAlert.builder()
                        .title(title)
                        .description(desc)
                        .severity(severity)
                        .affectedCount(entry.getValue().size())
                        .category(entry.getValue().get(0).getCategory())
                        .department(entry.getValue().get(0).getDepartment())
                        .build();

                newAlerts.add(alertRepository.save(alert));
            }
        }

        return alertRepository.findAllByOrderByCreatedAtDesc();
    }
}
