package com.resortregistry.dto;

/**
 * Kết quả tính giá server-side cho một booking tiềm năng.
 */
public class QuoteResponse {
    private Long propertyId;
    private Integer months;
    private Double monthlyPrice;
    private Double basePrice;       // monthlyPrice × months
    private Double processingFee;   // tổng các % phí enabled áp cho tổng giá thuê
    private Double deposit;         // tổng các % phí enabled áp cho tháng đầu tiên
    private Double total;           // basePrice + processingFee + deposit

    public QuoteResponse() {}

    public QuoteResponse(Long propertyId, Integer months, Double monthlyPrice,
                         Double basePrice, Double processingFee, Double deposit, Double total) {
        this.propertyId = propertyId;
        this.months = months;
        this.monthlyPrice = monthlyPrice;
        this.basePrice = basePrice;
        this.processingFee = processingFee;
        this.deposit = deposit;
        this.total = total;
    }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
    public Integer getMonths() { return months; }
    public void setMonths(Integer months) { this.months = months; }
    public Double getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(Double monthlyPrice) { this.monthlyPrice = monthlyPrice; }
    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }
    public Double getProcessingFee() { return processingFee; }
    public void setProcessingFee(Double processingFee) { this.processingFee = processingFee; }
    public Double getDeposit() { return deposit; }
    public void setDeposit(Double deposit) { this.deposit = deposit; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}
