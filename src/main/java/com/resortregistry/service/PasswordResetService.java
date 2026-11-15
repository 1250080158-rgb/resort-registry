package com.resortregistry.service;

import com.resortregistry.entity.PasswordResetToken;
import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.PasswordResetTokenRepository;
import com.resortregistry.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Tạo token cho user; trả về chuỗi token để gửi email. */
    @Transactional
    public String createToken(User user) {
        tokenRepository.invalidateAllForUser(user.getId());
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setUserId(user.getId());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);
        return resetToken.getToken();
    }

    /**
     * Đặt lại mật khẩu theo token; ném BusinessException nếu token sai/hết hạn/đã
     * dùng.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new BusinessException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Mã đặt lại mật khẩu không hợp lệ"));
        if (resetToken.isUsed()) {
            throw new BusinessException("Mã đặt lại mật khẩu đã được sử dụng");
        }
        if (resetToken.isExpired()) {
            throw new BusinessException("Mã đặt lại mật khẩu đã hết hạn, vui lòng yêu cầu mã mới");
        }
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new BusinessException("Tài khoản không tồn tại"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
