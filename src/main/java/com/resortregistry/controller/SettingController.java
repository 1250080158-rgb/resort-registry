package com.resortregistry.controller;

import com.resortregistry.service.SettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Cấu hình hệ thống (chỉ ADMIN — chặn ở SecurityConfig):
 * GET /api/settings trả toàn bộ key-value, PUT /api/settings cập nhật hàng loạt.
 */
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingController {
    private final SettingService settingService;

    public SettingController(SettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getAll() {
        return ResponseEntity.ok(settingService.getAll());
    }

    @PutMapping
    public ResponseEntity<Map<String, String>> updateAll(@RequestBody Map<String, String> settings) {
        settingService.updateAll(settings);
        return ResponseEntity.ok(settingService.getAll());
    }
}
