package com.resortregistry.config;

import com.resortregistry.entity.Booking;
import com.resortregistry.entity.Fee;
import com.resortregistry.entity.Property;
import com.resortregistry.entity.User;
import com.resortregistry.repository.BookingRepository;
import com.resortregistry.repository.FeeRepository;
import com.resortregistry.repository.PropertyRepository;
import com.resortregistry.repository.UserRepository;
import com.resortregistry.service.SettingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seed dữ liệu mẫu khi database rỗng (H2 in-memory khởi động sạch sau mỗi lần chạy,
 * SQL Server lần đầu sau khi Flyway tạo bảng) — dữ liệu mẫu đặt ở đây thay vì file SQL.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final FeeRepository feeRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingService settingService;

    public DataInitializer(UserRepository userRepository, PropertyRepository propertyRepository,
                           BookingRepository bookingRepository, FeeRepository feeRepository,
                           PasswordEncoder passwordEncoder, SettingService settingService) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.bookingRepository = bookingRepository;
        this.feeRepository = feeRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingService = settingService;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Đã có dữ liệu, bỏ qua seed
        }

        List<User> users = seedUsers();
        List<Property> properties = seedProperties();
        seedFees();
        seedBookings(users, properties);
        seedSettings();

        log.info("[DataInitializer] Seeded {} users, {} properties, 6 bookings, 5 fees.",
                users.size(), properties.size());
    }

    /** Cấu hình mặc định cho trang Cài Đặt của admin (key-value trong bảng app_settings). */
    private void seedSettings() {
        Map<String, String> defaults = new LinkedHashMap<>();
        defaults.put("website.name", "ResortRegistry");
        defaults.put("website.tagline", "Nền tảng đăng ký nhà ở khu nghỉ dưỡng hàng đầu Việt Nam");
        defaults.put("website.email", "support@resortregistry.vn");
        defaults.put("website.phone", "1800 8888");
        defaults.put("website.address", "12 Phố Huế, Hai Bà Trưng, Hà Nội");
        defaults.put("website.facebook", "https://facebook.com/resortregistry");
        defaults.put("website.instagram", "https://instagram.com/resortregistry");
        defaults.put("payment.stripePublic", "pk_test_51...XXX");
        defaults.put("payment.mode", "test");
        defaults.put("payment.currency", "VND");
        defaults.put("payment.minDeposit", "1");
        defaults.put("payment.processingFeeRate", "5");
        defaults.put("security.sessionTimeout", "60");
        defaults.put("security.maxLoginAttempts", "5");
        defaults.put("security.passwordMinLength", "8");
        defaults.put("security.twoFactor", "false");
        defaults.put("security.ipWhitelist", "false");
        defaults.put("security.autoLogout", "true");
        defaults.put("notifications.emailNewBooking", "true");
        defaults.put("notifications.emailCancellation", "true");
        defaults.put("notifications.emailPayment", "true");
        defaults.put("notifications.smsNewBooking", "false");
        defaults.put("notifications.smsPayment", "true");
        defaults.put("notifications.adminDailyReport", "true");
        settingService.updateAll(defaults);
    }

    private List<User> seedUsers() {
        User u1 = buildUser("Nguyễn Minh Tuấn", "tuan.nguyen@gmail.com", "0912 345 678",
                "079088012345", "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", User.UserRole.USER,
                User.UserStatus.ACTIVE, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format");
        u1.setTotalBookings(3);
        u1.setTotalSpent(650.0);

        User u2 = buildUser("Trần Thị Hương", "huong.tran@company.vn", "0987 654 321",
                "079091054321", "45 Hoàng Diệu, Hải Châu, Đà Nẵng", User.UserRole.USER,
                User.UserStatus.ACTIVE, "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&auto=format");
        u2.setTotalBookings(2);
        u2.setTotalSpent(340.0);

        User u3 = buildUser("Lê Văn Đức", "duc.le@startup.io", "0908 123 456",
                "038087078901", "8 Trần Phú, Hà Nội", User.UserRole.USER,
                User.UserStatus.ACTIVE, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format");
        u3.setTotalBookings(1);
        u3.setTotalSpent(120.0);

        User u4 = buildUser("Phạm Thị Lan", "lan.pham@business.com", "0934 567 890",
                "001082045678", "88 Lê Lợi, Bến Nghé, Quận 1, TP.HCM", User.UserRole.USER,
                User.UserStatus.BANNED, "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&auto=format");

        // Tài khoản admin demo: admin@resortregistry.vn / admin123
        User admin = buildUser("Hoàng Anh Khoa", "admin@resortregistry.vn", "0909 888 999",
                "074080099888", "1 Đống Đa, Hà Nội", User.UserRole.ADMIN,
                User.UserStatus.ACTIVE, "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&auto=format");
        admin.setPassword(passwordEncoder.encode("admin123"));

        return userRepository.saveAll(List.of(u1, u2, u3, u4, admin));
    }

    private User buildUser(String name, String email, String phone, String cmnd, String address,
                           User.UserRole role, User.UserStatus status, String avatar) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setCmnd(cmnd);
        user.setAddress(address);
        user.setRole(role);
        user.setStatus(status);
        user.setAvatar(avatar);
        user.setPassword(passwordEncoder.encode("123456")); // Mật khẩu demo chung cho tài khoản user
        user.setJoinDate(LocalDateTime.now().minusMonths(6));
        return user;
    }

    private List<Property> seedProperties() {
        Property p1 = buildProperty("Biệt Thự Bãi Biển Azure", "Azure Bay Resort", "Bãi biển Mỹ Khê", "Đà Nẵng",
                "Biệt thự sang trọng với tầm nhìn toàn cảnh bãi biển Mỹ Khê, thiết kế hiện đại kết hợp phong cách Đông Nam Á. Hồ bơi riêng, sân vườn rộng rãi và đội ngũ phục vụ 24/7 đảm bảo trải nghiệm sống đẳng cấp nhất.",
                85.0, 4, 3, 320, Property.PropertyType.VILLA, Property.PropertyStatus.AVAILABLE,
                "Hồ bơi riêng,Bãi đỗ xe,Sân vườn,BBQ ngoài trời,Phòng gym,Wifi tốc độ cao,An ninh 24/7,Bếp đầy đủ,Điều hòa trung tâm,Smart TV",
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop&auto=format",
                4.9, 47, true);

        Property p2 = buildProperty("Pearl Island Penthouse", "Pearl Island Grand", "Bãi Trường", "Phú Quốc",
                "Penthouse đỉnh cao 42 tầng với tầm nhìn 360° ra biển Phú Quốc và vịnh Thái Lan. Thiết kế tối giản sang trọng với vật liệu marble Italy và đồ nội thất thương hiệu quốc tế.",
                120.0, 3, 3, 280, Property.PropertyType.PENTHOUSE, Property.PropertyStatus.AVAILABLE,
                "Rooftop pool,Sky lounge,Spa & Wellness,Concierge 24/7,Valet parking,Phòng hội nghị,Nhà hàng riêng,Helipad access,Wine cellar,Smart home",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop&auto=format",
                4.8, 31, true);

        Property p3 = buildProperty("Villa Hội An Cổ Phố", "Heritage Hoi An Retreat", "Cẩm An", "Hội An",
                "Villa phong cách Hội An cổ kính kết hợp tiện nghi hiện đại. Kiến trúc mái ngói truyền thống, sân vườn tre xanh mát và hồ bơi tích hợp phản chiếu vẻ đẹp văn hóa miền Trung.",
                65.0, 3, 2, 240, Property.PropertyType.VILLA, Property.PropertyStatus.AVAILABLE,
                "Hồ bơi riêng,Vườn Nhật,Xe đạp miễn phí,Lớp học nấu ăn,Yoga deck,Wifi cao tốc,Bếp full,Phòng trà,Dịch vụ giặt ủi,Tour văn hóa",
                "https://images.unsplash.com/photo-1540541338537-b11f8a4f1e7a?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop&auto=format",
                4.7, 63, true);

        Property p4 = buildProperty("Coral Bay Bungalow", "Coral Bay Resort", "Bãi Biển Bãi Dài", "Nha Trang",
                "Bungalow trên mặt biển với lối đi riêng xuống bãi cát trắng mịn. Kiến trúc eco-friendly bằng vật liệu tự nhiên, hòa hợp hoàn toàn với thiên nhiên nhiệt đới.",
                55.0, 2, 2, 180, Property.PropertyType.BUNGALOW, Property.PropertyStatus.BOOKED,
                "Lối riêng ra biển,Kayak & SUP,Snorkeling gear,Nền tảng trên nước,Hammock garden,Mini bar,Điều hòa,Outdoor shower,Fire pit,Morning yoga",
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1439130490301-25e322d88054?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&auto=format",
                4.6, 89, false);

        Property p5 = buildProperty("Cliffside Villa Mũi Né", "Mui Ne Summit Resort", "Mũi Né", "Bình Thuận",
                "Villa cheo leo trên vách đá với tầm nhìn panoramic ra Biển Đông. Hồ bơi vô cực tích hợp cảnh quan biển, kiến trúc minimalist mạnh mẽ tôn lên vẻ hoang sơ của thiên nhiên.",
                75.0, 3, 2, 260, Property.PropertyType.VILLA, Property.PropertyStatus.AVAILABLE,
                "Hồ bơi vô cực,Cliff view terrace,Sunset bar,Private chef,Spa tại nhà,Windsurfing access,ATV tours,Wine collection,Fire lounge,Stargazing deck",
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format",
                4.9, 28, false);

        Property p6 = buildProperty("Island Eco Villa Côn Đảo", "Con Dao National Reserve", "Côn Sơn", "Bà Rịa - Vũng Tàu",
                "Villa sinh thái độc đáo trong vùng bảo tồn quốc gia Côn Đảo. Hòa mình vào thiên nhiên nguyên sơ với dịch vụ luxury-eco, lặn biển coral reef và trải nghiệm rùa biển đẻ trứng.",
                95.0, 2, 2, 200, Property.PropertyType.VILLA, Property.PropertyStatus.MAINTENANCE,
                "Reef diving,Turtle watching tour,Kayaking,Nature trails,Solar powered,Organic meals,Marine research,Snorkeling,Sea kayak,Night safari",
                "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=800&fit=crop&auto=format",
                4.8, 19, false);

        // Hai tài sản đăng BÁN (giá đơn vị: triệu VNĐ — 12500 = 12,5 tỷ)
        Property p7 = buildProperty("Golden Sand Beach Villa", "Golden Sand Estate", "Bãi Sau", "Bà Rịa - Vũng Tàu",
                "Biệt thự biển nguyên căn dành để bán, vị trí vàng mặt tiền bãi Sau. Thiết kế 3 tầng hiện đại, hồ bơi vô cực nhìn ra biển, pháp lý minh bạch, sổ hồng lâu dài.",
                12500.0, 5, 5, 450, Property.PropertyType.VILLA, Property.PropertyStatus.AVAILABLE,
                Property.TransactionType.BUY,
                "Hồ bơi vô cực,Sân vườn,Phòng gym,Smart home,An ninh 24/7,Bãi xe 4 ô tô,Garage riêng,Sân thượng BBQ",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop&auto=format",
                4.9, 12, true);

        Property p8 = buildProperty("Marina Bay Penthouse", "Marina Bay Complex", "Khu Marina", "Đà Nẵng",
                "Penthouse 2 tầng cao cấp dành để bán tại khu phức hợp Marina Bay. Nội thất full thương hiệu, tầm nhìn sông Hàn và cầu Rồng, tiện ích khách sạn 5 sao ngay dưới tòa nhà.",
                6800.0, 4, 4, 300, Property.PropertyType.PENTHOUSE, Property.PropertyStatus.AVAILABLE,
                Property.TransactionType.BUY,
                "Sky lounge,Concierge 24/7,Hồ bơi vô cực,Phòng gym,Spa,Valet parking,Smart home,Bảo hiểm 24/7,Thang máy riêng",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop&auto=format,https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&h=800&fit=crop&auto=format",
                4.8, 9, false);

        return propertyRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6, p7, p8));
    }

    private Property buildProperty(String name, String resort, String location, String province, String description,
                                   double price, int bedrooms, int bathrooms, int area, Property.PropertyType type,
                                   Property.PropertyStatus status, String amenities, String images,
                                   double rating, int reviews, boolean featured) {
        return buildProperty(name, resort, location, province, description, price, bedrooms, bathrooms, area,
                type, status, Property.TransactionType.RENT, amenities, images, rating, reviews, featured);
    }

    private Property buildProperty(String name, String resort, String location, String province, String description,
                                   double price, int bedrooms, int bathrooms, int area, Property.PropertyType type,
                                   Property.PropertyStatus status, Property.TransactionType transactionType,
                                   String amenities, String images, double rating, int reviews, boolean featured) {
        Property p = new Property();
        p.setName(name);
        p.setResort(resort);
        p.setLocation(location);
        p.setProvince(province);
        p.setDescription(description);
        p.setPrice(price);
        p.setBedrooms(bedrooms);
        p.setBathrooms(bathrooms);
        p.setArea(area);
        p.setType(type);
        p.setStatus(status);
        p.setTransactionType(transactionType);
        p.setAmenities(amenities);
        p.setImages(images);
        p.setRating(rating);
        p.setReviews(reviews);
        p.setFeatured(featured);
        return p;
    }

    private void seedFees() {
        Fee f1 = new Fee();
        f1.setName("Phí Xử Lý Hồ Sơ");
        f1.setType(Fee.FeeType.PERCENTAGE);
        f1.setAmount(5.0);
        f1.setEnabled(true);
        f1.setDescription("Phí xử lý và kiểm tra hồ sơ đăng ký");
        f1.setAppliesTo("Tổng giá thuê");

        Fee f2 = new Fee();
        f2.setName("Đặt Cọc An Toàn");
        f2.setType(Fee.FeeType.PERCENTAGE);
        f2.setAmount(100.0);
        f2.setEnabled(true);
        f2.setDescription("Bằng 1 tháng tiền thuê, hoàn trả khi kết thúc hợp đồng");
        f2.setAppliesTo("Tháng đầu tiên");

        Fee f3 = new Fee();
        f3.setName("Phí Hủy Đặt Chỗ (trước 30 ngày)");
        f3.setType(Fee.FeeType.PERCENTAGE);
        f3.setAmount(20.0);
        f3.setEnabled(true);
        f3.setDescription("Phí hủy nếu thông báo trước 30 ngày");
        f3.setAppliesTo("Tổng đặt cọc");

        Fee f4 = new Fee();
        f4.setName("Phí Hủy Đặt Chỗ (trong vòng 30 ngày)");
        f4.setType(Fee.FeeType.PERCENTAGE);
        f4.setAmount(50.0);
        f4.setEnabled(true);
        f4.setDescription("Phí hủy nếu thông báo trong vòng 30 ngày");
        f4.setAppliesTo("Tổng đặt cọc");

        Fee f5 = new Fee();
        f5.setName("Phí Dịch Vụ Bổ Sung");
        f5.setType(Fee.FeeType.FIXED);
        f5.setAmount(2.0);
        f5.setEnabled(false);
        f5.setDescription("Phí dịch vụ phụ trội hàng tháng");
        f5.setAppliesTo("Mỗi tháng");

        feeRepository.saveAll(List.of(f1, f2, f3, f4, f5));
    }

    private void seedBookings(List<User> users, List<Property> properties) {
        User u1 = users.get(0);
        User u2 = users.get(1);
        User u3 = users.get(2);
        Property p1 = properties.get(0);
        Property p2 = properties.get(1);
        Property p3 = properties.get(2);
        Property p4 = properties.get(3);
        Property p5 = properties.get(4);

        Booking b1 = buildBooking(u1, p1,
                LocalDateTime.of(2026, 10, 1, 14, 0), LocalDateTime.of(2027, 4, 1, 12, 0), 6,
                510.0, 25.5, 170.0, 705.5, Booking.BookingStatus.CONFIRMED, Booking.PaymentStatus.PAID,
                "Thẻ tín dụng Visa", "Khách hàng VIP, yêu cầu dọn dẹp hằng ngày");
        b1.setCreatedAt(LocalDateTime.now().minusMonths(1));

        Booking b2 = buildBooking(u2, p3,
                LocalDateTime.of(2026, 11, 1, 14, 0), LocalDateTime.of(2027, 1, 1, 12, 0), 2,
                130.0, 6.5, 65.0, 201.5, Booking.BookingStatus.CONFIRMED, Booking.PaymentStatus.PAID,
                "Chuyển khoản ngân hàng", null);
        b2.setCreatedAt(LocalDateTime.now().minusMonths(2));

        Booking b3 = buildBooking(u3, p2,
                LocalDateTime.of(2026, 12, 1, 14, 0), LocalDateTime.of(2027, 1, 1, 12, 0), 1,
                120.0, 6.0, 40.0, 166.0, Booking.BookingStatus.PENDING, Booking.PaymentStatus.UNPAID,
                "Chưa thanh toán", "Yêu cầu thêm giường phụ");
        b3.setCreatedAt(LocalDateTime.now().minusDays(5));

        Booking b4 = buildBooking(u1, p5,
                LocalDateTime.of(2025, 6, 1, 14, 0), LocalDateTime.of(2025, 9, 1, 12, 0), 3,
                225.0, 11.25, 75.0, 311.25, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID,
                "Thẻ tín dụng Mastercard", null);
        b4.setCreatedAt(LocalDateTime.now().minusMonths(4));

        Booking b5 = buildBooking(u2, p4,
                LocalDateTime.of(2025, 1, 1, 14, 0), LocalDateTime.of(2025, 3, 1, 12, 0), 2,
                110.0, 5.5, 55.0, 170.5, Booking.BookingStatus.COMPLETED, Booking.PaymentStatus.PAID,
                "Ví điện tử MoMo", null);
        b5.setCreatedAt(LocalDateTime.now().minusMonths(7));

        Booking b6 = buildBooking(u1, p3,
                LocalDateTime.of(2024, 3, 1, 14, 0), LocalDateTime.of(2024, 5, 1, 12, 0), 2,
                130.0, 6.5, 65.0, 201.5, Booking.BookingStatus.CANCELLED, Booking.PaymentStatus.REFUNDED,
                "Thẻ tín dụng Visa", "Hủy do lý do cá nhân, hoàn tiền 80%");
        b6.setCreatedAt(LocalDateTime.now().minusMonths(10));

        bookingRepository.saveAll(List.of(b1, b2, b3, b4, b5, b6));
    }

    private Booking buildBooking(User user, Property property, LocalDateTime startDate, LocalDateTime endDate,
                                 int months, double basePrice, double processingFee, double deposit, double totalPrice,
                                 Booking.BookingStatus status, Booking.PaymentStatus paymentStatus,
                                 String paymentMethod, String notes) {
        Booking b = new Booking();
        b.setUserId(user.getId());
        b.setPropertyId(property.getId());
        b.setPropertyName(property.getName());
        b.setResort(property.getResort());
        b.setUserName(user.getName());
        b.setUserEmail(user.getEmail());
        b.setUserPhone(user.getPhone());
        b.setStartDate(startDate);
        b.setEndDate(endDate);
        b.setMonths(months);
        b.setTransactionType(Booking.TransactionType.RENT);
        b.setBasePrice(basePrice);
        b.setProcessingFee(processingFee);
        b.setDeposit(deposit);
        b.setTotalPrice(totalPrice);
        b.setStatus(status);
        b.setPaymentStatus(paymentStatus);
        b.setPaymentMethod(paymentMethod);
        b.setNotes(notes);
        b.setCreatedAt(LocalDateTime.now());
        return b;
    }
}
