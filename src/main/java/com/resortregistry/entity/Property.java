package com.resortregistry.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String resort;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String province;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    @Column(nullable = false)
    private Integer area;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer reviews;

    private Integer floorLevel;

    private Boolean featured = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PropertyType {
        VILLA, PENTHOUSE, BUNGALOW, APARTMENT
    }

    public enum PropertyStatus {
        AVAILABLE, BOOKED, MAINTENANCE
    }

    public enum TransactionType {
        RENT, BUY
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getResort() { return resort; }
    public void setResort(String resort) { this.resort = resort; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    public Integer getArea() { return area; }
    public void setArea(Integer area) { this.area = area; }

    public PropertyType getType() { return type; }
    public void setType(PropertyType type) { this.type = type; }

    public PropertyStatus getStatus() { return status; }
    public void setStatus(PropertyStatus status) { this.status = status; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public Integer getFloorLevel() { return floorLevel; }
    public void setFloorLevel(Integer floorLevel) { this.floorLevel = floorLevel; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
