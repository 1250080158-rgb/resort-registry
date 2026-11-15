package com.resortregistry.repository;

import com.resortregistry.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByCustomerIdAndStaffId(Long customerId, Long staffId);
    List<Chat> findByCustomerId(Long customerId);
    List<Chat> findByStaffId(Long staffId);
    List<Chat> findByCustomerIdAndStaffIdOrderByCreatedAtAsc(Long customerId, Long staffId);
    List<Chat> findBySenderId(Long senderId);
    List<Chat> findByCustomerIdAndIsReadFalse(Long customerId);
    List<Chat> findByStaffIdAndIsReadFalse(Long staffId);
}