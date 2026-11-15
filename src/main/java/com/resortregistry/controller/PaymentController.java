package com.resortregistry.controller;

import com.resortregistry.entity.Booking;
import com.resortregistry.entity.PaymentTransaction;
import com.resortregistry.entity.User;
import com.resortregistry.security.CurrentUser;
import com.resortregistry.security.ForbiddenException;
import com.resortregistry.service.BookingService;
import com.resortregistry.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingService bookingService;
    private final CurrentUser currentUser;

    public PaymentController(PaymentService paymentService, BookingService bookingService, CurrentUser currentUser) {
        this.paymentService = paymentService;
        this.bookingService = bookingService;
        this.currentUser = currentUser;
    }

    /** Thanh toán một booking (owner hoặc admin). Body: {"bookingId": 1, "method": "Thẻ tín dụng"} */
    @PostMapping
    public ResponseEntity<PaymentTransaction> pay(@RequestBody Map<String, Object> request) {
        User requester = currentUser.require();
        Long bookingId = request.get("bookingId") != null ? Long.valueOf(request.get("bookingId").toString()) : null;
        if (bookingId == null) {
            throw new ForbiddenException("Thiếu mã đặt chỗ");
        }
        String method = request.get("method") != null ? request.get("method").toString() : null;
        return ResponseEntity.ok(paymentService.pay(bookingId, method, requester));
    }

    /** Danh sách giao dịch của một booking (owner hoặc admin). */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentTransaction>> getByBooking(@PathVariable Long bookingId) {
        User requester = currentUser.require();
        Booking booking = bookingService.getBookingById(bookingId);
        if (booking != null && !booking.getUserId().equals(requester.getId()) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem giao dịch của đặt chỗ của chính mình");
        }
        return ResponseEntity.ok(paymentService.getByBooking(bookingId));
    }

    /** Hoàn tiền giao dịch thành công mới nhất của booking (chỉ ADMIN). */
    @PostMapping("/booking/{bookingId}/refund")
    public ResponseEntity<PaymentTransaction> refund(@PathVariable Long bookingId) {
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ ADMIN mới được hoàn tiền");
        }
        return ResponseEntity.ok(paymentService.refundByBooking(bookingId));
    }

    /** Xác nhận thanh toán đang chờ (chỉ ADMIN). */
    @PostMapping("/confirm/{transactionId}")
    public ResponseEntity<PaymentTransaction> confirmPayment(@PathVariable Long transactionId) {
        User admin = currentUser.require();
        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new ForbiddenException("Chỉ ADMIN mới được xác nhận thanh toán");
        }
        return ResponseEntity.ok(paymentService.confirmPayment(transactionId, admin));
    }
}
