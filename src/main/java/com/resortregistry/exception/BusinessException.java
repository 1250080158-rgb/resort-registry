package com.resortregistry.exception;

/**
 * Lỗi nghiệp vụ (vi phạm quy tắc kinh doanh) — GlobalExceptionHandler sẽ map thành HTTP 400.
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
