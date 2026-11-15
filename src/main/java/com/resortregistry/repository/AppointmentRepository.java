package com.resortregistry.repository;

import com.resortregistry.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerId(Long customerId);
    List<Appointment> findByStaffId(Long staffId);
    List<Appointment> findByStatus(Appointment.AppointmentStatus status);
    List<Appointment> findByAppointmentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Appointment> findByCustomerIdAndStaffId(Long customerId, Long staffId);
}