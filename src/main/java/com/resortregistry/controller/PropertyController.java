package com.resortregistry.controller;

import com.resortregistry.entity.Property;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.service.PropertyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {
    private final PropertyService propertyService;
    private final String uploadDir;

    public PropertyController(PropertyService propertyService,
                              @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.propertyService = propertyService;
        this.uploadDir = uploadDir;
    }

    @GetMapping
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        Property property = propertyService.getPropertyById(id);
        if (property != null) {
            return ResponseEntity.ok(property);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/available")
    public ResponseEntity<List<Property>> getAvailableProperties() {
        return ResponseEntity.ok(propertyService.getAvailableProperties());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Property>> getFeaturedProperties() {
        return ResponseEntity.ok(propertyService.getFeaturedProperties());
    }

    @GetMapping("/available-featured")
    public ResponseEntity<List<Property>> getAvailableFeaturedProperties() {
        return ResponseEntity.ok(propertyService.getAvailableFeaturedProperties());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Property>> searchProperties(@RequestParam String keyword) {
        return ResponseEntity.ok(propertyService.searchProperties(keyword));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Property>> getPropertiesByType(@PathVariable String type) {
        try {
            Property.PropertyType propertyType = Property.PropertyType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(propertyService.getPropertiesByType(propertyType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/province/{province}")
    public ResponseEntity<List<Property>> getPropertiesByProvince(@PathVariable String province) {
        return ResponseEntity.ok(propertyService.getPropertiesByProvince(province));
    }

    @GetMapping("/transaction/{transactionType}")
    public ResponseEntity<List<Property>> getPropertiesByTransactionType(@PathVariable String transactionType) {
        try {
            Property.TransactionType type = Property.TransactionType.valueOf(transactionType.toUpperCase());
            return ResponseEntity.ok(propertyService.getPropertiesByTransactionType(type));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(@RequestBody Property property) {
        return ResponseEntity.ok(propertyService.createProperty(property));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(@PathVariable Long id, @RequestBody Property property) {
        Property updatedProperty = propertyService.updateProperty(id, property);
        if (updatedProperty != null) {
            return ResponseEntity.ok(updatedProperty);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Tải lên ảnh thật cho tài sản (multipart), lưu vào thư mục upload
     * và nối URL /uploads/<file> vào danh sách ảnh của tài sản.
     */
    @PostMapping("/{id}/images")
    public ResponseEntity<Property> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Property property = propertyService.getPropertyById(id);
        if (property == null) {
            return ResponseEntity.notFound().build();
        }
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File ảnh không được để trống");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Chỉ chấp nhận file ảnh (PNG, JPG, ...)");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("Ảnh tối đa 10MB");
        }

        try {
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0 && dot < original.length() - 1) {
                ext = original.substring(dot).toLowerCase();
                if (!ext.matches("\\.(png|jpg|jpeg|gif|webp)")) {
                    throw new BusinessException("Định dạng ảnh không hỗ trợ");
                }
            }
            String filename = UUID.randomUUID() + ext;
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            String url = "/uploads/" + filename;
            String current = property.getImages();
            property.setImages(current == null || current.isBlank() ? url : current + "," + url);
            return ResponseEntity.ok(propertyService.updateProperty(id, property));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Lưu ảnh thất bại: " + e.getMessage());
        }
    }
}
