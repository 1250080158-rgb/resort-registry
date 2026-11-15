package com.resortregistry.service;

import com.resortregistry.dto.CreateBookingRequest;
import com.resortregistry.dto.QuoteResponse;
import com.resortregistry.entity.Booking;
import com.resortregistry.entity.Property;
import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.BookingRepository;
import com.resortregistry.repository.PropertyRepository;
import com.resortregistry.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final FeeService feeService;

    public BookingService(BookingRepository bookingRepository, PropertyRepository propertyRepository,
                          UserRepository userRepository, FeeService feeService) {
        this.bookingRepository = bookingRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.feeService = feeService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getBookingsByPropertyId(Long propertyId) {
        return bookingRepository.findByPropertyId(propertyId);
    }

    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public List<Booking> getBookingsByTransactionType(Booking.TransactionType transactionType) {
        return bookingRepository.findByTransactionType(transactionType);
    }

    /**
     * Tạo booking: mọi quy tắc nghiệp vụ và giá tiền đều quyết ở đây,
     * client chỉ gửi userId/propertyId/months/startDate.
     */
    @Transactional
    public Booking createBooking(CreateBookingRequest request) {
        Integer months = request.getMonths();
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new BusinessException("Tài sản không tồn tại"));
        if (property.getStatus() != Property.PropertyStatus.AVAILABLE) {
            throw new BusinessException("Tài sản hiện không khả dụng để đặt");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new BusinessException("Người dùng không tồn tại"));
        if (user.getStatus() == User.UserStatus.BANNED) {
            throw new BusinessException("Tài khoản đã bị khóa, không thể đặt chỗ");
        }

        LocalDate start;
        try {
            start = LocalDate.parse(request.getStartDate());
        } catch (Exception e) {
            throw new BusinessException("Ngày bắt đầu không hợp lệ (định dạng yyyy-MM-dd)");
        }
        if (start.isBefore(LocalDate.now())) {
            throw new BusinessException("Ngày bắt đầu phải từ hôm nay trở đi");
        }

        LocalDateTime startDate = start.atTime(14, 0);
        LocalDateTime endDate = start.plusMonths(months).atTime(12, 0);
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                property.getId(), Booking.BookingStatus.CANCELLED, startDate, endDate);
        if (!overlaps.isEmpty()) {
            throw new BusinessException("Tài sản đã có người đặt trong khoảng thời gian này, vui lòng chọn ngày khác");
        }

        // Giá tính từ bảng fees trên server, bỏ qua bất kỳ giá nào client gửi lên
        QuoteResponse quote = feeService.quote(property, months);

        Booking booking = new Booking();
        booking.setUserId(user.getId());
        booking.setPropertyId(property.getId());
        booking.setPropertyName(property.getName());
        booking.setResort(property.getResort());
        booking.setUserName(user.getName());
        booking.setUserEmail(user.getEmail());
        booking.setUserPhone(user.getPhone());
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setMonths(months);
        booking.setTransactionType(Booking.TransactionType.RENT);
        booking.setBasePrice(quote.getBasePrice());
        booking.setProcessingFee(quote.getProcessingFee());
        booking.setDeposit(quote.getDeposit());
        booking.setTotalPrice(quote.getTotal());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setPaymentStatus(Booking.PaymentStatus.UNPAID);
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setNotes(request.getNotes());
        booking.setCreatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    /** Kiểm tra tài sản còn trống cho khoảng thời gian yêu cầu hay không. */
    public boolean checkAvailability(Long propertyId, LocalDate startDate, Integer months) {
        Property property = propertyRepository.findById(propertyId).orElse(null);
        if (property == null || property.getStatus() != Property.PropertyStatus.AVAILABLE) {
            return false;
        }
        if (startDate == null || months == null || months < 1) {
            return false;
        }
        LocalDateTime start = startDate.atTime(14, 0);
        LocalDateTime end = startDate.plusMonths(months).atTime(12, 0);
        return bookingRepository.findOverlappingBookings(
                propertyId, Booking.BookingStatus.CANCELLED, start, end).isEmpty();
    }

    /**
     * Đổi trạng thái booking và đồng bộ trạng thái tài sản:
     * CONFIRMED → tài sản thành BOOKED; CANCELLED → mở lại AVAILABLE nếu không còn lịch hiệu lực.
     */
    @Transactional
    public Booking updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return null;
        }
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);

        Property property = propertyRepository.findById(booking.getPropertyId()).orElse(null);
        if (property != null) {
            if (status == Booking.BookingStatus.CONFIRMED
                    && property.getStatus() != Property.PropertyStatus.BOOKED) {
                property.setStatus(Property.PropertyStatus.BOOKED);
                propertyRepository.save(property);
            } else if (status == Booking.BookingStatus.CANCELLED
                    && property.getStatus() == Property.PropertyStatus.BOOKED) {
                // booking vừa hủy đã bị loại khỏi kết quả truy vấn (status <> CANCELLED)
                List<Booking> active = bookingRepository.findOverlappingBookings(
                        property.getId(), Booking.BookingStatus.CANCELLED,
                        booking.getStartDate(), booking.getEndDate());
                if (active.isEmpty()) {
                    property.setStatus(Property.PropertyStatus.AVAILABLE);
                    propertyRepository.save(property);
                }
            }
        }
        return saved;
    }

    /**
     * Đổi trạng thái thanh toán; khi một booking được trả tiền (lần đầu)
     * thì cộng tổng đặt chỗ và tổng chi tiêu của người dùng.
     */
    @Transactional
    public Booking updatePaymentStatus(Long id, Booking.PaymentStatus paymentStatus) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return null;
        }
        boolean wasPaid = booking.getPaymentStatus() == Booking.PaymentStatus.PAID;
        booking.setPaymentStatus(paymentStatus);
        Booking saved = bookingRepository.save(booking);

        if (!wasPaid && paymentStatus == Booking.PaymentStatus.PAID) {
            User user = userRepository.findById(booking.getUserId()).orElse(null);
            if (user != null) {
                int currentBookings = user.getTotalBookings() != null ? user.getTotalBookings() : 0;
                double currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : 0.0;
                user.setTotalBookings(currentBookings + 1);
                user.setTotalSpent(currentSpent + booking.getTotalPrice());
                userRepository.save(user);
            }
        }
        return saved;
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public Long getConfirmedBookingsCount(LocalDateTime since) {
        return bookingRepository.countConfirmedBookingsSince(since);
    }

    /** Doanh thu theo tháng (1 câu GROUP BY) cho dashboard. */
    public List<Object[]> getRevenueByMonth(LocalDateTime since) {
        return bookingRepository.sumPaidRevenueByMonth(Booking.PaymentStatus.PAID, since);
    }
}
