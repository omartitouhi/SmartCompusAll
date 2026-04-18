package org.example.smartcampus.repository;

import org.example.smartcampus.entity.PasswordResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    List<PasswordResetRequest> findAllByOrderByRequestedAtDesc();
    long countBySeenFalse();
}
