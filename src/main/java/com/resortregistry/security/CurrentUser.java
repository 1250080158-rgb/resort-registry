package com.resortregistry.security;

import com.resortregistry.entity.User;
import com.resortregistry.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Lấy user hiện tại từ SecurityContext (principal = email đặt trong JWT).
 */
@Component
public class CurrentUser {

    private final UserRepository userRepository;

    public CurrentUser(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** User đang đăng nhập, hoặc null nếu chưa/chỉ là anonymous. */
    public User get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            return null;
        }
        return userRepository.findByEmail(authentication.getPrincipal().toString()).orElse(null);
    }

    /** Bắt buộc đã đăng nhập, nếu không ném ForbiddenException (→ 403). */
    public User require() {
        User user = get();
        if (user == null) {
            throw new ForbiddenException("Chưa đăng nhập");
        }
        return user;
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
