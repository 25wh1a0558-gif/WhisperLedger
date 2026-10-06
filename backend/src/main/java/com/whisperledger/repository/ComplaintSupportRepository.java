package com.whisperledger.repository;

import com.whisperledger.entity.ComplaintSupport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ComplaintSupportRepository extends JpaRepository<ComplaintSupport, Long> {
    Optional<ComplaintSupport> findByComplaintIdAndSupporterId(Long complaintId, Long supporterId);
    boolean existsByComplaintIdAndSupporterId(Long complaintId, Long supporterId);
    List<ComplaintSupport> findByComplaintId(Long complaintId);
    long countByComplaintId(Long complaintId);
}
