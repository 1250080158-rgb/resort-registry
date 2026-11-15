package com.resortregistry.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request tạo booking mới. Giá tiền KHÔNG gửi từ client — server tự tính
 * từ bảng fees (xem FeeService.quote) để chặn việc giả mạo giá.
 */
public class CreateBookingRequest {

    @NotNull(message = "Thiếu thông tin người đặt")
    private Long userId;

    @NotNull(message = "Thiếu thông tin tài sản")
    private Long propertyId;

    @NotNull(message = "Thời hạn thuê không được để trống")
    @Min(value = 1, message = "Thời hạn thuê tối thiểu 1 tháng")
    @Max(value = 36, message = "Thời hạn thuê tối đa 36 tháng")
    private Integer months;

    /** Định dạng yyyy-MM-dd */
    @NotBlank(message = "Ngày bắt đầu không được để trống")
    private String startDate;

    private String notes;

    private String paymentMethod;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public Integer getMonths() { return months; }
    public void setMonths(Integer months) { this.months = months; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
