package com.whisperledger.controller;

import com.whisperledger.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ComplaintRepository complaintRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> data = new HashMap<>();

        // Department Statistics
        List<Object[]> deptResults = complaintRepository.countByDepartmentGroup();
        Map<String, Long> depts = new HashMap<>();
        for (Object[] row : deptResults) {
            depts.put((String) row[0], (Long) row[1]);
        }
        data.put("departmentStats", depts);

        // Category Statistics
        List<Object[]> catResults = complaintRepository.countByCategoryGroup();
        Map<String, Long> categories = new HashMap<>();
        for (Object[] row : catResults) {
            categories.put((String) row[0], (Long) row[1]);
        }
        data.put("categoryStats", categories);

        // Status Statistics
        List<Object[]> statusResults = complaintRepository.countByStatusGroup();
        Map<String, Long> statuses = new HashMap<>();
        for (Object[] row : statusResults) {
            statuses.put((String) row[0], (Long) row[1]);
        }
        data.put("statusStats", statuses);

        return ResponseEntity.ok(data);
    }
}
