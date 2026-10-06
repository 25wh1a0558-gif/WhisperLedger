-- ====================================================
-- WHISPER LEDGER: DATABASE SCHEMA (MySQL 8.0+)
-- Privacy-First Campus Grievance Platform
-- ====================================================

CREATE DATABASE IF NOT EXISTS whisper_ledger_db;
USE whisper_ledger_db;

-- 1. Users Table (Stores authentication & verification credentials; identity never linked directly to complaints)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- STUDENT, HOD, DEAN, GRIEVANCE_COMMITTEE, ADMIN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaints Table (Student identity is strictly decoupled into anonymous_id)
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(60) NOT NULL, -- RAGGING, HARASSMENT, HOSTEL, ACADEMIC, INFRASTRUCTURE, FACULTY_ISSUE, EXAM_RELATED, SAFETY, OTHER
    department VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    anonymous_id VARCHAR(100) NOT NULL, -- Blind cryptographic pseudonym e.g., ANON-CSE-8942-F2
    support_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_complaints_dept (department),
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_anon (anonymous_id)
);

-- 3. ComplaintSupport Table ("Me Too" anonymous upvotes)
CREATE TABLE IF NOT EXISTS complaint_support (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    supporter_id BIGINT NOT NULL, -- User ID stored hashed/salted for one-vote-per-student check
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_complaint_supporter (complaint_id, supporter_id),
    CONSTRAINT fk_support_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 4. ComplaintMessage Table (Anonymous 2-Way Chat)
CREATE TABLE IF NOT EXISTS complaint_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    sender_role VARCHAR(40) NOT NULL, -- STUDENT (Anonymous), HOD, DEAN, GRIEVANCE_COMMITTEE, ADMIN
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 5. ComplaintStatusHistory Table (Status timeline)
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    old_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    remarks VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 6. EscalationLog Table (Automatic Escalation Engine Records)
CREATE TABLE IF NOT EXISTS escalation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    current_level VARCHAR(40) NOT NULL, -- LEVEL_1_HOD, LEVEL_2_DEAN, LEVEL_3_COMMITTEE
    escalated_to VARCHAR(60) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_escalation_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 7. SystemAlert Table (AI Recurring Problem Clusters & Campus Alerts)
CREATE TABLE IF NOT EXISTS system_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- INFO, WARNING, CRITICAL
    affected_count INT DEFAULT 1,
    category VARCHAR(60),
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. LedgerBlocks Table (Tamper-proof cryptographic block audit chain)
CREATE TABLE IF NOT EXISTS ledger_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    block_index BIGINT NOT NULL,
    complaint_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    block_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
