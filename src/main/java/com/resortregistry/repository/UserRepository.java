package com.resortregistry.repository;

import com.resortregistry.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByCmnd(String cmnd);
    List<User> findByRole(User.UserRole role);
    List<User> findByStatus(User.UserStatus status);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByCmnd(String cmnd);
}
