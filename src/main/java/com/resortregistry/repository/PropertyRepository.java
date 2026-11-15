package com.resortregistry.repository;

import com.resortregistry.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByStatus(Property.PropertyStatus status);
    List<Property> findByFeaturedTrue();
    List<Property> findByType(Property.PropertyType type);
    List<Property> findByProvince(String province);
    List<Property> findByTransactionType(Property.TransactionType transactionType);
    
    @Query("SELECT p FROM Property p WHERE p.status = 'AVAILABLE' AND p.featured = true")
    List<Property> findAvailableFeaturedProperties();
    
    @Query("SELECT p FROM Property p WHERE p.resort LIKE %:keyword% OR p.name LIKE %:keyword% OR p.province LIKE %:keyword%")
    List<Property> searchProperties(String keyword);
}
