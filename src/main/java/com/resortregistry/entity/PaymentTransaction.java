package com.resortregistry.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Một giao dịch thanh toán (mô phỏng cổng thanh toán) gắn với một booking.
 */
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TxStatus status;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum TxStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
    public TxStatus getStatus() { return status; }
    public void setStatus(TxStatus status) { this.status = status; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
