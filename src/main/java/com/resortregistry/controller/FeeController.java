package com.resortregistry.controller;

import com.resortregistry.entity.Fee;
import com.resortregistry.service.FeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*")
public class FeeController {
    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public ResponseEntity<List<Fee>> getAllFees() {
        return ResponseEntity.ok(feeService.getAllFees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fee> getFeeById(@PathVariable Long id) {
        Fee fee = feeService.getFeeById(id);
        if (fee != null) {
            return ResponseEntity.ok(fee);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/enabled")
    public ResponseEntity<List<Fee>> getEnabledFees() {
        return ResponseEntity.ok(feeService.getEnabledFees());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Fee>> getFeesByType(@PathVariable String type) {
        try {
            Fee.FeeType feeType = Fee.FeeType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(feeService.getFeesByType(feeType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<Fee> createFee(@RequestBody Fee fee) {
        return ResponseEntity.ok(feeService.createFee(fee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fee> updateFee(@PathVariable Long id, @RequestBody Fee fee) {
        Fee updatedFee = feeService.updateFee(id, fee);
        if (updatedFee != null) {
            return ResponseEntity.ok(updatedFee);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Fee> toggleFeeEnabled(@PathVariable Long id) {
        Fee fee = feeService.toggleFeeEnabled(id);
        if (fee != null) {
            return ResponseEntity.ok(fee);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.noContent().build();
    }
}
