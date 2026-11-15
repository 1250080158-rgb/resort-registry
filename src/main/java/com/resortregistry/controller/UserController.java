package com.resortregistry.controller;

import com.resortregistry.entity.User;
import com.resortregistry.security.CurrentUser;
import com.resortregistry.security.ForbiddenException;
import com.resortregistry.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;
    private final CurrentUser currentUser;

    public UserController(UserService userService, CurrentUser currentUser) {
        this.userService = userService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        requireAdmin();
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User requester = currentUser.require();
        if (!requester.getId().equals(id) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem thông tin của chính mình");
        }
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        requireAdmin();
        User user = userService.getUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        requireAdmin();
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            return ResponseEntity.ok(userService.getUsersByRole(userRole));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<User>> getActiveUsers() {
        requireAdmin();
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        requireAdmin();
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User requester = currentUser.require();
        if (!requester.getId().equals(id) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được sửa thông tin của chính mình");
        }
        if (!currentUser.isAdmin()) {
            // Người dùng thường không được tự đổi role/status — giữ nguyên giá trị cũ
            User existing = userService.getUserById(id);
            if (existing != null) {
                user.setRole(existing.getRole());
                user.setStatus(existing.getStatus());
            }
        }
        User updatedUser = userService.updateUser(id, user);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        requireAdmin();
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/login")
    public ResponseEntity<User> updateLastLogin(@PathVariable Long id) {
        User requester = currentUser.require();
        if (!requester.getId().equals(id) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Không có quyền thao tác trên tài khoản này");
        }
        User user = userService.updateLastLogin(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordRequest) {
        String currentPassword = passwordRequest.get("currentPassword");
        String newPassword = passwordRequest.get("newPassword");
        String confirmPassword = passwordRequest.get("confirmPassword");

        // Validation
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu hiện tại không được để trống"));
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu mới không được để trống"));
        }
        if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Xác nhận mật khẩu không được để trống"));
        }
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu mới và xác nhận mật khẩu không khớp"));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu mới phải có ít nhất 6 ký tự"));
        }

        // Chỉ chủ tài khoản mới được đổi mật khẩu của chính mình
        User requester = currentUser.require();
        if (!requester.getId().equals(id)) {
            throw new ForbiddenException("Chỉ được đổi mật khẩu của chính mình");
        }

        if (userService.getUserById(id) == null) {
            return ResponseEntity.notFound().build();
        }

        userService.changePassword(id, currentPassword, newPassword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đổi mật khẩu thành công");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> updateAvatar(@PathVariable Long id, @RequestBody Map<String, String> avatarRequest) {
        String avatarUrl = avatarRequest.get("avatar");

        if (avatarUrl == null || avatarUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL avatar không được để trống"));
        }

        User requester = currentUser.require();
        if (!requester.getId().equals(id) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Không có quyền cập nhật avatar của người khác");
        }

        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setAvatar(avatarUrl);
        User updatedUser = userService.updateUser(id, user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cập nhật avatar thành công");
        response.put("user", updatedUser);
        return ResponseEntity.ok(response);
    }

    private void requireAdmin() {
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền thực hiện thao tác này");
        }
    }
}
