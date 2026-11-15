package com.resortregistry.service;

import com.resortregistry.entity.AppSetting;
import com.resortregistry.repository.AppSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SettingService {

    private final AppSettingRepository appSettingRepository;

    public SettingService(AppSettingRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }

    /** Toàn bộ cấu hình dạng Map key → value (bảo toàn thứ tự chèn). */
    public Map<String, String> getAll() {
        Map<String, String> result = new LinkedHashMap<>();
        for (AppSetting setting : appSettingRepository.findAll()) {
            result.put(setting.getKey(), setting.getValue());
        }
        return result;
    }

    /** Cập nhật hàng loạt key (upsert), dùng cho trang Cài Đặt của admin. */
    @Transactional
    public void updateAll(Map<String, String> settings) {
        if (settings == null) return;
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            if (entry.getKey() == null || entry.getKey().isBlank()) continue;
            AppSetting setting = appSettingRepository.findById(entry.getKey())
                    .orElseGet(() -> new AppSetting(entry.getKey(), ""));
            setting.setValue(entry.getValue() != null ? entry.getValue() : "");
            appSettingRepository.save(setting);
        }
    }
}
