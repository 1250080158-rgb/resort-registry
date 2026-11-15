package com.resortregistry.service;

import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final int maxFailedAttempts;
    private final long lockMinutes;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       @Value("${app.security.max-failed-attempts:5}") int maxFailedAttempts,
                       @Value("${app.security.lock-minutes:15}") long lockMinutes) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockMinutes = lockMinutes;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> getActiveUsers() {
        return userRepository.findByStatus(User.UserStatus.ACTIVE);
    }

    public User createUser(User user) {
        user.setJoinDate(LocalDateTime.now());
        user.setTotalBookings(0);
        user.setTotalSpent(0.0);
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User user) {
        User existingUser = userRepository.findById(id).orElse(null);
        if (existingUser != null) {
            existingUser.setName(user.getName());
            existingUser.setEmail(user.getEmail());
            existingUser.setPhone(user.getPhone());
            existingUser.setCmnd(user.getCmnd());
            existingUser.setAddress(user.getAddress());
            existingUser.setRole(user.getRole());
            existingUser.setStatus(user.getStatus());
            existingUser.setAvatar(user.getAvatar());
            // Chỉ ghi đè password khi request có gửi mật khẩu mới (lưu dạng BCrypt),
            // tránh mất mật khẩu khi PUT /users không kèm trường này
            if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(existingUser);
        }
        return null;
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User updateLastLogin(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setLastLogin(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }

    /**
     * Kiểm tra mật khẩu khi đăng nhập + xử lý khóa tài khoản:
     * sai quá maxFailedAttempts lần liên tiếp → khóa lockMinutes phút.
     *
     * @return true nếu khớp mật khẩu
     */
    @Transactional
    public boolean verifyPassword(User user, String rawPassword) {
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            long minutes = Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            throw new BusinessException("Tài khoản tạm khóa do nhập sai mật khẩu nhiều lần, thử lại sau " + minutes + " phút");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
            if (attempts >= maxFailedAttempts) {
                user.setFailedLoginAttempts(0);
                user.setLockedUntil(LocalDateTime.now().plusMinutes(lockMinutes));
            } else {
                user.setFailedLoginAttempts(attempts);
            }
            userRepository.save(user);
            return false;
        }

        if ((user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0)
                || user.getLockedUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            userRepository.save(user);
        }
        return true;
    }

    @Transactional
    public void changePassword(Long id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Người dùng không tồn tại"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    public boolean existsByCmnd(String cmnd) {
        return userRepository.existsByCmnd(cmnd);
    }
}
