package com.resortregistry.service;

import com.resortregistry.entity.Booking;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Gửi email xác nhận booking. Khi chưa cấu hình spring.mail.host
 * (mặc định ở dev) chỉ ghi log nội dung email thay vì gửi thật.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender; // null khi chưa cấu hình SMTP
    private final String host;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${spring.mail.host:}") String host) {
        this.mailSender = mailSenderProvider.getIfAvailable();
        this.host = host;
    }

    public void sendBookingConfirmation(Booking booking) {
        String subject = "ResortRegistry - Xác nhận đặt chỗ #" + booking.getId();
        String body = """
                Xin chào %s,

                Cảm ơn bạn đã đặt chỗ tại ResortRegistry.

                Mã đặt chỗ: #%d
                Tài sản: %s (%s)
                Thời gian: %s → %s (%d tháng)
                Tổng thanh toán: %.2f triệu VNĐ
                Phương thức: %s

                Trạng thái đặt chỗ: %s
                Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.

                Trân trọng,
                ResortRegistry
                """.formatted(
                booking.getUserName(), booking.getId(), booking.getPropertyName(), booking.getResort(),
                booking.getStartDate().toLocalDate(), booking.getEndDate().toLocalDate(),
                booking.getMonths(), booking.getTotalPrice(),
                booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "---",
                booking.getStatus());

        if (mailSender == null || host == null || host.isBlank()) {
            log.info("[EMAIL:DEV] Chưa cấu hình SMTP — ghi log thay vì gửi. To: {}\nSubject: {}\n{}",
                    booking.getUserEmail(), subject, body);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setRecipients(MimeMessage.RecipientType.TO, booking.getUserEmail());
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("[EMAIL] Gửi email thất bại tới {}: {}", booking.getUserEmail(), e.getMessage());
        }
    }

    public boolean isMailConfigured() {
        return mailSender != null && host != null && !host.isBlank();
    }

    public void sendPasswordResetEmail(String to, String token) {
        String subject = "ResortRegistry - Đặt lại mật khẩu";
        String body = """
                Xin chào,

                Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản ResortRegistry.

                Mã đặt lại mật khẩu của bạn:
                %s

                Mã có hiệu lực trong 30 phút và chỉ dùng được một lần.
                Nếu bạn không yêu cầu, hãy bỏ qua email này.

                Trân trọng,
                ResortRegistry
                """.formatted(token);

        if (!isMailConfigured()) {
            log.info("[EMAIL:DEV] Chưa cấu hình SMTP — ghi log thay vì gửi. To: {}\nSubject: {}\n{}", to, subject, body);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            message.setRecipients(MimeMessage.RecipientType.TO, to);
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("[EMAIL] Gửi email thất bại tới {}: {}", to, e.getMessage());
        }
    }
}
