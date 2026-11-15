package com.resortregistry.security;

/**
 * Đã đăng nhập nhưng không đủ quyền (403).
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
