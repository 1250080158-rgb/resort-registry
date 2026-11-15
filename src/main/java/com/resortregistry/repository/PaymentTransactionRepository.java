package com.resortregistry.repository;

import com.resortregistry.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
