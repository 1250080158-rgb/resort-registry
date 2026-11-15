package com.resortregistry.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Cấu hình hệ thống dạng key-value (vd: website.name, payment.mode, security.twoFactor),
 * quản trị viên sửa từ trang Cài Đặt.
 */
@Entity
@Table(name = "app_settings")
public class AppSetting {
    @Id
    @Column(name = "setting_key", length = 100)
    private String key;

    // "setting_value" thay vì "value" vì VALUE là từ khóa reserved của H2
    @Column(name = "setting_value", nullable = false, length = 1000)
    private String value;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public AppSetting() {
    }

    public AppSetting(String key, String value) {
        this.key = key;
        this.value = value;
    }

    // Getters and Setters
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
