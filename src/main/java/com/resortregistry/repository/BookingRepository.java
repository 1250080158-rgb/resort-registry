package com.resortregistry.repository;

import com.resortregistry.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByPropertyId(Long propertyId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByPaymentStatus(Booking.PaymentStatus paymentStatus);
    List<Booking> findByTransactionType(Booking.TransactionType transactionType);
    
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.startDate BETWEEN :start AND :end")
    List<Booking> findByDateRange(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CONFIRMED' AND b.createdAt >= :startDate")
    Long countConfirmedBookingsSince(LocalDateTime startDate);

    /**
     * Các booking của một tài sản còn hiệu lực (không tính đã hủy) mà chồng lấn khoảng thời gian.
     * Dùng để chặn double-booking: start < end mới VÀ end > start mới.
     */
    @Query("SELECT b FROM Booking b WHERE b.propertyId = :propertyId " +
           "AND b.status <> :excluded " +
           "AND b.startDate < :end AND b.endDate > :start")
    List<Booking> findOverlappingBookings(Long propertyId, Booking.BookingStatus excluded,
                                          LocalDateTime start, LocalDateTime end);

    /**
     * Doanh thu đã thanh toán gộp theo năm-tháng (1 câu query duy nhất).
     * Row: [year(Integer), month(Integer), sumRevenue(Double), countBooking(Long)]
     */
    @Query("SELECT YEAR(b.createdAt), MONTH(b.createdAt), SUM(b.totalPrice), COUNT(b) " +
           "FROM Booking b WHERE b.paymentStatus = :paid AND b.createdAt >= :since " +
           "GROUP BY YEAR(b.createdAt), MONTH(b.createdAt)")
    List<Object[]> sumPaidRevenueByMonth(Booking.PaymentStatus paid, LocalDateTime since);
}
