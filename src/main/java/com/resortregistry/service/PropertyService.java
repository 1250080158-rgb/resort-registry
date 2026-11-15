package com.resortregistry.service;

import com.resortregistry.entity.Property;
import com.resortregistry.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id).orElse(null);
    }

    public List<Property> getAvailableProperties() {
        return propertyRepository.findByStatus(Property.PropertyStatus.AVAILABLE);
    }

    public List<Property> getFeaturedProperties() {
        return propertyRepository.findByFeaturedTrue();
    }

    public List<Property> getAvailableFeaturedProperties() {
        return propertyRepository.findAvailableFeaturedProperties();
    }

    public List<Property> searchProperties(String keyword) {
        return propertyRepository.searchProperties(keyword);
    }

    public List<Property> getPropertiesByType(Property.PropertyType type) {
        return propertyRepository.findByType(type);
    }

    public List<Property> getPropertiesByProvince(String province) {
        return propertyRepository.findByProvince(province);
    }

    public List<Property> getPropertiesByTransactionType(Property.TransactionType transactionType) {
        return propertyRepository.findByTransactionType(transactionType);
    }

    public Property createProperty(Property property) {
        // Set default transaction type if not provided
        if (property.getTransactionType() == null) {
            property.setTransactionType(Property.TransactionType.RENT);
        }
        return propertyRepository.save(property);
    }

    public Property updateProperty(Long id, Property property) {
        Property existingProperty = propertyRepository.findById(id).orElse(null);
        if (existingProperty != null) {
            existingProperty.setName(property.getName());
            existingProperty.setResort(property.getResort());
            existingProperty.setLocation(property.getLocation());
            existingProperty.setProvince(property.getProvince());
            existingProperty.setDescription(property.getDescription());
            existingProperty.setPrice(property.getPrice());
            existingProperty.setBedrooms(property.getBedrooms());
            existingProperty.setBathrooms(property.getBathrooms());
            existingProperty.setArea(property.getArea());
            existingProperty.setType(property.getType());
            existingProperty.setStatus(property.getStatus());
            existingProperty.setTransactionType(property.getTransactionType());
            existingProperty.setAmenities(property.getAmenities());
            existingProperty.setImages(property.getImages());
            existingProperty.setRating(property.getRating());
            existingProperty.setReviews(property.getReviews());
            existingProperty.setFloorLevel(property.getFloorLevel());
            existingProperty.setFeatured(property.getFeatured());
            return propertyRepository.save(existingProperty);
        }
        return null;
    }

    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
    }
}
