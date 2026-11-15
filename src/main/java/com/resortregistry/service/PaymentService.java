package com.resortregistry.service;

import com.resortregistry.entity.Booking;
import com.resortregistry.entity.PaymentTransaction;
import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Thanh toán mô phỏng: mỗi lần trả tiền tạo một bản ghi giao dịch SUCCESS,
 * hoàn tiền chuyển giao dịch mới nhất sang REFUNDED và đánh dấu booking REFUNDED.
 */
@Service
public class PaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final BookingService bookingService;
    private final EmailService emailService;

    public PaymentService(PaymentTransactionRepository transactionRepository,
                          BookingService bookingService, EmailService emailService) {
        this.transactionRepository = transactionRepository;
        this.bookingService = bookingService;
        this.emailService = emailService;
    }

    @Transactional
    public PaymentTransaction pay(Long bookingId, String method, User payer) {
        Booking booking = bookingService.getBookingById(bookingId);
        if (booking == null) {
            throw new BusinessException("Đặt chỗ không tồn tại");
        }
        if (!payer.getId().equals(booking.getUserId()) && payer.getRole() != User.UserRole.ADMIN) {
            throw new BusinessException("Chỉ được thanh toán đặt chỗ của chính mình");
        }
        if (booking.getPaymentStatus() == Booking.PaymentStatus.PAID) {
            throw new BusinessException("Đặt chỗ này đã được thanh toán");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BusinessException("Đặt chỗ đã bị hủy, không thể thanh toán");
        }

        PaymentTransaction tx = new PaymentTransaction();
        tx.setBookingId(bookingId);
        tx.setAmount(booking.getTotalPrice());
        tx.setMethod(method != null && !method.isBlank() ? method : "Không xác định");
        tx.setStatus(PaymentTransaction.TxStatus.PENDING); // Changed to PENDING
        tx.setReference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        PaymentTransaction saved = transactionRepository.save(tx);

        // Don't update payment status to PAID yet - wait for admin confirmation
        // Don't send booking confirmation email yet
        return saved;
    }

    @Transactional
    public PaymentTransaction confirmPayment(Long transactionId, User admin) {
        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new BusinessException("Chỉ ADMIN mới được xác nhận thanh toán");
        }

        PaymentTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new BusinessException("Giao dịch không tồn tại"));

        if (tx.getStatus() != PaymentTransaction.TxStatus.PENDING) {
            throw new BusinessException("Giao dịch không ở trạng thái chờ xác nhận");
        }

        tx.setStatus(PaymentTransaction.TxStatus.SUCCESS);
        PaymentTransaction saved = transactionRepository.save(tx);

        // Update booking payment status
        bookingService.updatePaymentStatus(tx.getBookingId(), Booking.PaymentStatus.PAID);

        // Send booking confirmation email
        Booking booking = bookingService.getBookingById(tx.getBookingId());
        if (booking != null) {
            emailService.sendBookingConfirmation(booking);
        }

        return saved;
    }

    public List<PaymentTransaction> getByBooking(Long bookingId) {
        return transactionRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    @Transactional
    public PaymentTransaction refundByBooking(Long bookingId) {
        List<PaymentTransaction> txs = transactionRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
        PaymentTransaction latest = txs.stream()
                .filter(t -> t.getStatus() == PaymentTransaction.TxStatus.SUCCESS)
                .findFirst()
                .orElseThrow(() -> new BusinessException("Không có giao dịch thành công nào để hoàn tiền"));

        latest.setStatus(PaymentTransaction.TxStatus.REFUNDED);
        transactionRepository.save(latest);
        bookingService.updatePaymentStatus(bookingId, Booking.PaymentStatus.REFUNDED);
        return latest;
    }
}
