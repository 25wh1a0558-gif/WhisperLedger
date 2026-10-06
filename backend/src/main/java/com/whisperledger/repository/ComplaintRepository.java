package com.whisperledger.repository;

import com.whisperledger.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByAnonymousIdOrderByCreatedAtDesc(String anonymousId);
    List<Complaint> findByDepartmentOrderByCreatedAtDesc(String department);
    List<Complaint> findByStatusOrderByCreatedAtDesc(String status);
    List<Complaint> findAllByOrderByCreatedAtDesc();

    @Query("SELECT c.department, COUNT(c) FROM Complaint c GROUP BY c.department")
    List<Object[]> countByDepartmentGroup();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategoryGroup();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatusGroup();
}
