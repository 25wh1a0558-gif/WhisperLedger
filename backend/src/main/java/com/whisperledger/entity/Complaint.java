package com.whisperledger.entity;

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
    private String category; // RAGGING, HARASSMENT, HOSTEL, ACADEMIC, INFRASTRUCTURE, FACULTY_ISSUE, EXAM_RELATED, SAFETY, OTHER

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

    @PreUpdate
    public void setLastUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
