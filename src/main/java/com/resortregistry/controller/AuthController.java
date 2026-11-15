package com.resortregistry.controller;

import com.resortregistry.dto.LoginRequest;
import com.resortregistry.dto.RegisterRequest;
import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.security.JwtService;
import com.resortregistry.service.EmailService;
import com.resortregistry.service.PasswordResetService;
import com.resortregistry.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    public AuthController(UserService userService, JwtService jwtService,
                          PasswordResetService passwordResetService, EmailService emailService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Kiểm tra email đã tồn tại
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email đã tồn tại"));
        }

        // Kiểm tra số điện thoại đã tồn tại
        if (userService.existsByPhone(request.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại đã tồn tại"));
        }

        // Kiểm tra CMND đã tồn tại
        if (userService.existsByCmnd(request.getCmnd())) {
            return ResponseEntity.badRequest().body(Map.of("error", "CMND đã tồn tại"));
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone().trim());
        user.setCmnd(request.getCmnd().trim());
        user.setAddress(request.getAddress().trim());
        user.setPassword(request.getPassword());

        // Đặt role mặc định là USER
        user.setRole(User.UserRole.USER);
        user.setStatus(User.UserStatus.ACTIVE);

        try {
            User createdUser = userService.createUser(user);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký thành công");
            response.put("token", jwtService.generateToken(createdUser)); // đăng ký xong đăng nhập luôn
            response.put("user", createdUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Đăng ký thất bại: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.getUserByEmail(request.getEmail().trim().toLowerCase());
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email không tồn tại"));
        }

        // Kiểm tra mật khẩu (BCrypt) + khóa tài khoản khi sai quá nhiều lần
        if (!userService.verifyPassword(user, request.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu không đúng"));
        }

        // Kiểm tra trạng thái tài khoản
        if (user.getStatus() == User.UserStatus.INACTIVE) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tài khoản chưa được kích hoạt"));
        }
        if (user.getStatus() == User.UserStatus.BANNED) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tài khoản đã bị khóa"));
        }

        // Cập nhật last login
        userService.updateLastLogin(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng nhập thành công");
        response.put("token", jwtService.generateToken(user));
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    /**
     * Quên mật khẩu: phát hành token 30 phút và gửi email hướng dẫn.
     * Luôn trả thông báo chung để không lộ email nào tồn tại; khi chạy dev
     * (chưa cấu hình SMTP) trả kèm devToken để luồng test được end-to-end.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email") != null ? request.get("email").trim().toLowerCase() : "";
        String message = "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hộp thư của bạn.";

        Map<String, Object> response = new HashMap<>();
        User user = userService.getUserByEmail(email);
        if (user != null && user.getStatus() != User.UserStatus.BANNED) {
            String token = passwordResetService.createToken(user);
            emailService.sendPasswordResetEmail(email, token);
            if (!emailService.isMailConfigured()) {
                response.put("devToken", token); // chế độ dev: trả token trực tiếp
                message += " (Chế độ dev chưa cấu hình SMTP — dùng mã bên dưới để đặt lại.)";
            }
        }
        response.put("success", true);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /** Đặt lại mật khẩu bằng token nhận từ email (một lần, hết hạn 30 phút). */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            passwordResetService.resetPassword(request.get("token"), request.get("newPassword"));
        } catch (BusinessException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.");
        return ResponseEntity.ok(response);
    }
}
