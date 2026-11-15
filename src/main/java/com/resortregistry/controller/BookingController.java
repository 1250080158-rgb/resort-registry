package com.resortregistry.controller;

import com.resortregistry.dto.CreateBookingRequest;
import com.resortregistry.dto.QuoteResponse;
import com.resortregistry.entity.Booking;
import com.resortregistry.entity.Property;
import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.security.CurrentUser;
import com.resortregistry.security.ForbiddenException;
import com.resortregistry.service.BookingService;
import com.resortregistry.service.FeeService;
import com.resortregistry.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    private final BookingService bookingService;
    private final PropertyService propertyService;
    private final FeeService feeService;
    private final CurrentUser currentUser;

    public BookingController(BookingService bookingService, PropertyService propertyService,
                             FeeService feeService, CurrentUser currentUser) {
        this.bookingService = bookingService;
        this.propertyService = propertyService;
        this.feeService = feeService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        User requester = currentUser.require();
        if (!booking.getUserId().equals(requester.getId()) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Không có quyền xem đặt chỗ này");
        }
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable Long userId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(userId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem đặt chỗ của chính mình");
        }
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Booking>> getBookingsByPropertyId(@PathVariable Long propertyId) {
        return ResponseEntity.ok(bookingService.getBookingsByPropertyId(propertyId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(bookingService.getBookingsByStatus(bookingStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/transaction/{transactionType}")
    public ResponseEntity<List<Booking>> getBookingsByTransactionType(@PathVariable String transactionType) {
        try {
            Booking.TransactionType type = Booking.TransactionType.valueOf(transactionType.toUpperCase());
            return ResponseEntity.ok(bookingService.getBookingsByTransactionType(type));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Báo giá server-side: tính phí xử lý + đặt cọc + tổng cộng từ bảng fees.
     * GET /api/bookings/quote?propertyId=1&months=3
     */
    @GetMapping("/quote")
    public ResponseEntity<QuoteResponse> getQuote(@RequestParam Long propertyId, @RequestParam Integer months) {
        if (months == null || months < 1 || months > 36) {
            throw new BusinessException("Thời hạn thuê phải từ 1 đến 36 tháng");
        }
        Property property = propertyService.getPropertyById(propertyId);
        if (property == null) {
            throw new BusinessException("Tài sản không tồn tại");
        }
        return ResponseEntity.ok(feeService.quote(property, months));
    }

    /**
     * Kiểm tra tài sản còn trống cho khoảng thời gian yêu cầu.
     * GET /api/bookings/availability?propertyId=1&startDate=2026-11-01&months=3
     */
    @GetMapping("/availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam Long propertyId,
            @RequestParam String startDate,
            @RequestParam Integer months) {
        LocalDate start;
        try {
            start = LocalDate.parse(startDate);
        } catch (Exception e) {
            throw new BusinessException("Ngày bắt đầu không hợp lệ (định dạng yyyy-MM-dd)");
        }
        return ResponseEntity.ok(Map.of("available", bookingService.checkAvailability(propertyId, start, months)));
    }

    /**
     * Tạo booking mới: server tự validate, tự tính giá và ép userId theo token
     * (user thường chỉ được đặt cho chính mình, ADMIN có thể đặt hộ).
     */
    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        User requester = currentUser.require();
        if (!currentUser.isAdmin()) {
            request.setUserId(requester.getId());
        }
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            Booking booking = bookingService.getBookingById(id);
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }
            User requester = currentUser.require();
            if (!currentUser.isAdmin()) {
                if (!booking.getUserId().equals(requester.getId())) {
                    throw new ForbiddenException("Không có quyền thay đổi đặt chỗ này");
                }
                if (bookingStatus != Booking.BookingStatus.CANCELLED) {
                    throw new ForbiddenException("Bạn chỉ có thể hủy đặt chỗ của mình");
                }
            }
            Booking updatedBooking = bookingService.updateBookingStatus(id, bookingStatus);
            return ResponseEntity.ok(updatedBooking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<Booking> updatePaymentStatus(@PathVariable Long id, @RequestParam String paymentStatus) {
        try {
            Booking.PaymentStatus status = Booking.PaymentStatus.valueOf(paymentStatus.toUpperCase());
            Booking booking = bookingService.getBookingById(id);
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }
            User requester = currentUser.require();
            if (!currentUser.isAdmin()) {
                if (!booking.getUserId().equals(requester.getId())) {
                    throw new ForbiddenException("Không có quyền thanh toán đặt chỗ này");
                }
                if (status != Booking.PaymentStatus.PAID) {
                    throw new ForbiddenException("Bạn chỉ có thể xác nhận thanh toán cho đặt chỗ của mình");
                }
            }
            Booking updatedBooking = bookingService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(updatedBooking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/confirmed")
    public ResponseEntity<Long> getConfirmedBookingsCount(@RequestParam(required = false) String since) {
        LocalDateTime sinceDate = since != null ? LocalDateTime.parse(since) : LocalDateTime.now().minusMonths(1);
        return ResponseEntity.ok(bookingService.getConfirmedBookingsCount(sinceDate));
    }
}
