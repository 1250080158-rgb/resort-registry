package com.resortregistry.controller;

import com.resortregistry.entity.Booking;
import com.resortregistry.entity.Fee;
import com.resortregistry.entity.Property;
import com.resortregistry.entity.User;
import com.resortregistry.service.BookingService;
import com.resortregistry.service.FeeService;
import com.resortregistry.service.PropertyService;
import com.resortregistry.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    private final PropertyService propertyService;
    private final UserService userService;
    private final BookingService bookingService;
    private final FeeService feeService;

    public DashboardController(PropertyService propertyService, UserService userService,
                              BookingService bookingService, FeeService feeService) {
        this.propertyService = propertyService;
        this.userService = userService;
        this.bookingService = bookingService;
        this.feeService = feeService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Property> allProperties = propertyService.getAllProperties();
        List<User> allUsers = userService.getAllUsers();
        List<Booking> allBookings = bookingService.getAllBookings();
        
        stats.put("totalProperties", allProperties.size());
        stats.put("availableProperties", allProperties.stream().filter(p -> p.getStatus() == Property.PropertyStatus.AVAILABLE).count());
        stats.put("totalUsers", allUsers.size());
        stats.put("activeUsers", allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.ACTIVE).count());
        stats.put("totalBookings", allBookings.size());
        stats.put("confirmedBookings", allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count());
        stats.put("pendingBookings", allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count());
        
        double totalRevenue = allBookings.stream()
                .filter(b -> b.getPaymentStatus() == Booking.PaymentStatus.PAID)
                .mapToDouble(Booking::getTotalPrice)
                .sum();
        stats.put("totalRevenue", totalRevenue);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since = now.minusMonths(11).withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        // 1 câu query GROUP BY thay vì quét toàn bộ bảng 12 lần
        List<Object[]> rows = bookingService.getRevenueByMonth(since);
        Map<Integer, Object[]> byMonth = new HashMap<>();
        for (Object[] row : rows) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            byMonth.put(year * 100 + month, row);
        }

        List<Map<String, Object>> revenueData = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i);
            int key = monthStart.getYear() * 100 + monthStart.getMonthValue();
            Object[] row = byMonth.get(key);
            double revenue = row != null ? ((Number) row[2]).doubleValue() : 0.0;
            int bookings = row != null ? ((Number) row[3]).intValue() : 0;

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", "T" + monthStart.getMonthValue());
            monthData.put("revenue", revenue);
            monthData.put("bookings", bookings);
            revenueData.add(monthData);
        }

        return ResponseEntity.ok(revenueData);
    }

    @GetMapping("/booking-status")
    public ResponseEntity<List<Map<String, Object>>> getBookingStatusData() {
        List<Map<String, Object>> statusData = new ArrayList<>();
        List<Booking> allBookings = bookingService.getAllBookings();
        
        Map<Booking.BookingStatus, Long> statusCounts = allBookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
        
        statusData.add(Map.of(
                "name", "Đã Xác Nhận",
                "value", statusCounts.getOrDefault(Booking.BookingStatus.CONFIRMED, 0L),
                "color", "#2D7A4F"
        ));
        statusData.add(Map.of(
                "name", "Đang Chờ",
                "value", statusCounts.getOrDefault(Booking.BookingStatus.PENDING, 0L),
                "color", "#D4860B"
        ));
        statusData.add(Map.of(
                "name", "Hoàn Thành",
                "value", statusCounts.getOrDefault(Booking.BookingStatus.COMPLETED, 0L),
                "color", "#1B5E7A"
        ));
        statusData.add(Map.of(
                "name", "Đã Hủy",
                "value", statusCounts.getOrDefault(Booking.BookingStatus.CANCELLED, 0L),
                "color", "#C0392B"
        ));
        
        return ResponseEntity.ok(statusData);
    }

    @GetMapping("/recent-bookings")
    public ResponseEntity<List<Booking>> getRecentBookings() {
        List<Booking> allBookings = bookingService.getAllBookings();
        List<Booking> recentBookings = allBookings.stream()
                .sorted(Comparator.comparing(Booking::getCreatedAt).reversed())
                .limit(10)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recentBookings);
    }
}
