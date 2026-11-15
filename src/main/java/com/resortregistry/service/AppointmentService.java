package com.resortregistry.service;

import com.resortregistry.entity.Appointment;
import com.resortregistry.entity.User;
import com.resortregistry.repository.AppointmentRepository;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id).orElse(null);
    }

    public List<Appointment> getAppointmentsByCustomerId(Long customerId) {
        return appointmentRepository.findByCustomerId(customerId);
    }

    public List<Appointment> getAppointmentsByStaffId(Long staffId) {
        return appointmentRepository.findByStaffId(staffId);
    }

    public List<Appointment> getAppointmentsByStatus(Appointment.AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    public Appointment createAppointment(Appointment appointment) {
        // Validate customer and staff exist
        User customer = userRepository.findById(appointment.getCustomerId()).orElse(null);
        User staff = userRepository.findById(appointment.getStaffId()).orElse(null);

        if (customer == null) {
            throw new BusinessException("Khách hàng không tồn tại");
        }
        if (staff == null) {
            throw new BusinessException("Nhân viên không tồn tại");
        }

        // Set customer and staff names from User entities
        appointment.setCustomerName(customer.getName());
        appointment.setCustomerEmail(customer.getEmail());
        appointment.setCustomerPhone(customer.getPhone());
        appointment.setStaffName(staff.getName());

        // Set default status if not set
        if (appointment.getStatus() == null) {
            appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        }

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, Appointment appointment) {
        Appointment existingAppointment = appointmentRepository.findById(id).orElse(null);
        if (existingAppointment != null) {
            existingAppointment.setAppointmentDate(appointment.getAppointmentDate());
            existingAppointment.setReason(appointment.getReason());
            existingAppointment.setNotes(appointment.getNotes());
            existingAppointment.setStatus(appointment.getStatus());
            return appointmentRepository.save(existingAppointment);
        }
        return null;
    }

    public Appointment updateAppointmentStatus(Long id, Appointment.AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment != null) {
            appointment.setStatus(status);
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    public List<Appointment> getAppointmentsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return appointmentRepository.findByAppointmentDateBetween(startDate, endDate);
    }
}