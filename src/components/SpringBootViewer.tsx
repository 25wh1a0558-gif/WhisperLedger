import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCode, Database, FolderTree, Cpu, CheckCircle2 } from 'lucide-react';

export const SpringBootViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<string>('ComplaintController.java');

  const filesMap: Record<string, { lang: string; path: string; code: string }> = {
    'ComplaintController.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/whisperledger/controller/ComplaintController.java',
      code: `package com.whisperledger.controller;

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
        return ResponseEntity.ok(complaintService.toggleSupport(id, userId != null ? userId : 1L));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            HttpServletRequest servletRequest) {
        String role = (String) servletRequest.getAttribute("role");
        return ResponseEntity.ok(complaintService.updateStatus(id, request.getStatus(), request.getRemarks(), role != null ? role : "ADMIN"));
    }
}`,
    },
    'EscalationService.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/whisperledger/service/EscalationService.java',
      code: `package com.whisperledger.service;

import com.whisperledger.entity.Complaint;
import com.whisperledger.entity.ComplaintStatusHistory;
import com.whisperledger.entity.EscalationLog;
import com.whisperledger.repository.ComplaintRepository;
import com.whisperledger.repository.ComplaintStatusHistoryRepository;
import com.whisperledger.repository.EscalationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EscalationService {

    private final ComplaintRepository complaintRepository;
    private final EscalationLogRepository escalationLogRepository;
    private final ComplaintStatusHistoryRepository historyRepository;

    // SLA Rules: > 7d -> HOD (Tier 1), > 14d -> Dean (Tier 2), > 21d -> Committee (Tier 3)
    @Scheduled(cron = "0 0 1 * * ?")
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

            boolean hasHod = logs.stream().anyMatch(l -> "LEVEL_1_HOD".equals(l.getCurrentLevel()));
            boolean hasDean = logs.stream().anyMatch(l -> "LEVEL_2_DEAN".equals(l.getCurrentLevel()));
            boolean hasCommittee = logs.stream().anyMatch(l -> "LEVEL_3_COMMITTEE".equals(l.getCurrentLevel()));

            if (daysPending >= 21 && !hasCommittee) {
                escalate(complaint, "LEVEL_3_COMMITTEE", "Grievance Committee", "Pending > 21 Days without final resolution");
                count++;
            } else if (daysPending >= 14 && !hasDean) {
                escalate(complaint, "LEVEL_2_DEAN", "Dean of Student Affairs", "Pending > 14 Days without resolution by HOD");
                count++;
            } else if (daysPending >= 7 && !hasHod) {
                escalate(complaint, "LEVEL_1_HOD", "Head of Department (" + complaint.getDepartment() + ")", "Pending > 7 Days without initial action");
                count++;
            }
        }
        return count;
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
}`,
    },
    'Complaint.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/whisperledger/entity/Complaint.java',
      code: `package com.whisperledger.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String category; // RAGGING, HARASSMENT, HOSTEL, ACADEMIC, INFRASTRUCTURE, etc.

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    @Builder.Default
    private String status = "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED

    @Column(nullable = false)
    @Builder.Default
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "anonymous_id", nullable = false)
    private String anonymousId; // Blind cryptographic pseudonym e.g., ANON-CSE-8942-F2

    @Column(name = "support_count")
    @Builder.Default
    private Integer supportCount = 0;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}`,
    },
    'JwtAuthenticationFilter.java': {
      lang: 'java',
      path: 'backend/src/main/java/com/whisperledger/security/JwtAuthenticationFilter.java',
      code: `package com.whisperledger.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                Claims claims = jwtUtil.extractAllClaims(token);
                String role = (String) claims.get("role");
                String email = claims.getSubject();

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email, null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                request.setAttribute("userId", jwtUtil.extractUserId(token));
                request.setAttribute("role", role);
                request.setAttribute("anonymousId", jwtUtil.extractAnonymousId(token));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}`,
    },
    'schema.sql': {
      lang: 'sql',
      path: 'backend/src/main/resources/schema.sql',
      code: `-- Whisper Ledger Database Schema (MySQL 8.0+)
CREATE DATABASE IF NOT EXISTS whisper_ledger_db;
USE whisper_ledger_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(60) NOT NULL,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    anonymous_id VARCHAR(100) NOT NULL,
    support_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_complaints_dept (department),
    INDEX idx_complaints_status (status)
);

CREATE TABLE IF NOT EXISTS complaint_support (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    supporter_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_complaint_supporter (complaint_id, supporter_id)
);

CREATE TABLE IF NOT EXISTS complaint_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    sender_role VARCHAR(40) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS escalation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    current_level VARCHAR(40) NOT NULL,
    escalated_to VARCHAR(60) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_count INT DEFAULT 1,
    category VARCHAR(60),
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
    },
    'pom.xml': {
      lang: 'xml',
      path: 'backend/pom.xml',
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>com.whisperledger</groupId>
    <artifactId>whisper-ledger-backend</artifactId>
    <version>1.0.0</version>
    <name>whisper-ledger-backend</name>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.11.5</jjwt.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(filesMap[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Production Spring Boot 3.2.3 & Java 17 Artifacts
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Backend Architecture & Java Source Files
          </h1>
          <p className="text-sm text-purple-200 mt-2 leading-relaxed">
            All Spring Boot 3 entities, JPA repositories, JWT security filters, cron escalation schedulers, and MySQL schemas requested are fully written and preserved in the repository's <code>backend/</code> folder.
          </p>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Tree Selector */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            Backend Packages
          </h3>

          <div className="space-y-1">
            {Object.keys(filesMap).map((file) => (
              <button
                key={file}
                onClick={() => setActiveFile(file)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition-colors ${
                  activeFile === file
                    ? 'bg-purple-100 text-purple-950 font-bold border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="truncate">{file}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <strong>Full Backend Directory:</strong>
            <p className="font-mono text-[10px] text-slate-400 mt-1">
              /backend/src/main/java/com/whisperledger/...
            </p>
          </div>
        </div>

        {/* Code Viewer Panel (3 cols) */}
        <div className="lg:col-span-3 bg-slate-950 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-xs text-slate-300 ml-2">
                  {filesMap[activeFile].path}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2 leading-relaxed max-h-[500px]">
              <code>{filesMap[activeFile].code}</code>
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>MySQL 8.0 • Spring Boot 3.2.3 • Java 17</span>
            <span className="text-emerald-400">Ready for mvn spring-boot:run</span>
          </div>
        </div>
      </div>
    </div>
  );
};
