package com.whisperledger.controller;

import com.whisperledger.dto.ComplaintDtos.*;
import com.whisperledger.service.ComplaintService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @RequestBody CreateComplaintRequest request,
            HttpServletRequest servletRequest) {
        String anonymousId = (String) servletRequest.getAttribute("anonymousId");
        Long userId = (Long) servletRequest.getAttribute("userId");
        if (anonymousId == null) {
            anonymousId = "ANON-TEMP-9999";
        }
        return ResponseEntity.ok(complaintService.createComplaint(request, anonymousId, userId));
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints(HttpServletRequest servletRequest) {
        Long userId = (Long) servletRequest.getAttribute("userId");
        return ResponseEntity.ok(complaintService.getAllComplaints(userId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(HttpServletRequest servletRequest) {
        String anonymousId = (String) servletRequest.getAttribute("anonymousId");
        Long userId = (Long) servletRequest.getAttribute("userId");
        return ResponseEntity.ok(complaintService.getMyComplaints(anonymousId, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        Long userId = (Long) servletRequest.getAttribute("userId");
        return ResponseEntity.ok(complaintService.getComplaintById(id, userId));
    }

    @PostMapping("/{id}/support")
    public ResponseEntity<ComplaintResponse> supportComplaint(
            @PathVariable Long id,
            HttpServletRequest servletRequest) {
        Long userId = (Long) servletRequest.getAttribute("userId");
        if (userId == null) {
            userId = 1L; // Fallback for testing
        }
        return ResponseEntity.ok(complaintService.toggleSupport(id, userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            HttpServletRequest servletRequest) {
        String role = (String) servletRequest.getAttribute("role");
        if (role == null) role = "ADMIN";
        return ResponseEntity.ok(complaintService.updateStatus(id, request.getStatus(), request.getRemarks(), role));
    }
}
