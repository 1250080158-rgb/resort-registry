package com.resortregistry.service;

import com.resortregistry.dto.QuoteResponse;
import com.resortregistry.entity.Fee;
import com.resortregistry.entity.Property;
import com.resortregistry.repository.FeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeeService {
    private final FeeRepository feeRepository;

    public FeeService(FeeRepository feeRepository) {
        this.feeRepository = feeRepository;
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public Fee getFeeById(Long id) {
        return feeRepository.findById(id).orElse(null);
    }

    public List<Fee> getEnabledFees() {
        return feeRepository.findByEnabledTrue();
    }

    public List<Fee> getFeesByType(Fee.FeeType type) {
        return feeRepository.findByType(type);
    }

    /**
     * Tính giá booking server-side dựa trên các phí đang bật trong bảng fees:
     * - Phí xử lý: các phí PERCENTAGE có appliesTo chứa "Tổng giá thuê" (mặc định 5% × tổng thuê)
     * - Đặt cọc:   các phí PERCENTAGE có appliesTo chứa "Tháng đầu tiên" (mặc định 100% × giá 1 tháng)
     * Client không được gửi giá — kết quả này là cơ sở duy nhất khi tạo booking.
     */
    public QuoteResponse quote(Property property, Integer months) {
        double monthly = property.getPrice() != null ? property.getPrice() : 0.0;
        int m = (months != null && months > 0) ? months : 1;
        double basePrice = monthly * m;

        List<Fee> enabledFees = feeRepository.findByEnabledTrue();
        double processingFee = 0.0;
        double deposit = 0.0;
        for (Fee fee : enabledFees) {
            if (fee.getType() != Fee.FeeType.PERCENTAGE || fee.getAmount() == null) {
                continue;
            }
            String appliesTo = fee.getAppliesTo() != null ? fee.getAppliesTo().toLowerCase() : "";
            if (appliesTo.contains("tổng giá thuê") || appliesTo.contains("tong gia thue")) {
                processingFee += basePrice * fee.getAmount() / 100.0;
            } else if (appliesTo.contains("tháng đầu tiên") || appliesTo.contains("thang dau tien")) {
                deposit += monthly * fee.getAmount() / 100.0;
            }
        }

        double total = basePrice + processingFee + deposit;
        return new QuoteResponse(property.getId(), m, monthly, basePrice, processingFee, deposit, total);
    }

    public Fee createFee(Fee fee) {
        return feeRepository.save(fee);
    }

    public Fee updateFee(Long id, Fee fee) {
        Fee existingFee = feeRepository.findById(id).orElse(null);
        if (existingFee != null) {
            existingFee.setName(fee.getName());
            existingFee.setType(fee.getType());
            existingFee.setAmount(fee.getAmount());
            existingFee.setEnabled(fee.getEnabled());
            existingFee.setDescription(fee.getDescription());
            existingFee.setAppliesTo(fee.getAppliesTo());
            return feeRepository.save(existingFee);
        }
        return null;
    }

    public void deleteFee(Long id) {
        feeRepository.deleteById(id);
    }

    public Fee toggleFeeEnabled(Long id) {
        Fee fee = feeRepository.findById(id).orElse(null);
        if (fee != null) {
            fee.setEnabled(!fee.getEnabled());
            return feeRepository.save(fee);
        }
        return null;
    }
}
