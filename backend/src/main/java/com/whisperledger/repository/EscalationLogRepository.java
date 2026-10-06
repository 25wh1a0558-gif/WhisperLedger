package com.whisperledger.repository;

import com.whisperledger.entity.EscalationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EscalationLogRepository extends JpaRepository<EscalationLog, Long> {
    List<EscalationLog> findByComplaintIdOrderByTimestampAsc(Long complaintId);
    List<EscalationLog> findAllByOrderByTimestampDesc();
}
