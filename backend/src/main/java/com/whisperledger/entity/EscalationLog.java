package com.whisperledger.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscalationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false)
    private Long complaintId;

    @Column(name = "current_level", nullable = false)
    private String currentLevel; // LEVEL_1_HOD, LEVEL_2_DEAN, LEVEL_3_COMMITTEE

    @Column(name = "escalated_to", nullable = false)
    private String escalatedTo;

    @Column(nullable = false)
    private String reason;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
