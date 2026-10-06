package com.whisperledger.controller;

import com.whisperledger.dto.ComplaintDtos.*;
import com.whisperledger.entity.ComplaintMessage;
import com.whisperledger.service.ComplaintService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ComplaintService complaintService;

    @GetMapping("/{complaintId}")
    public ResponseEntity<List<ComplaintMessage>> getMessages(@PathVariable Long complaintId) {
        return ResponseEntity.ok(complaintService.getMessages(complaintId));
    }

    @PostMapping("/send")
    public ResponseEntity<ComplaintMessage> sendMessage(
            @RequestBody SendMessageRequest request,
            HttpServletRequest servletRequest) {
        String role = (String) servletRequest.getAttribute("role");
        String senderRole = role != null ? role : "STUDENT";
        return ResponseEntity.ok(complaintService.sendMessage(request.getComplaintId(), senderRole, request.getMessage()));
    }
}
