package com.resortregistry.controller;

import com.resortregistry.entity.Appointment;
import com.resortregistry.entity.User;
import com.resortregistry.security.CurrentUser;
import com.resortregistry.security.ForbiddenException;
import com.resortregistry.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {
    private final AppointmentService appointmentService;
    private final CurrentUser currentUser;

    public AppointmentController(AppointmentService appointmentService, CurrentUser currentUser) {
        this.appointmentService = appointmentService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        if (appointment != null) {
            return ResponseEntity.ok(appointment);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByCustomerId(@PathVariable Long customerId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(customerId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem lịch hẹn của chính mình");
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsByCustomerId(customerId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStaffId(@PathVariable Long staffId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStaffId(staffId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable String status) {
        try {
            Appointment.AppointmentStatus appointmentStatus = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(appointmentStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/between")
    public ResponseEntity<List<Appointment>> getAppointmentsBetweenDates(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);
            return ResponseEntity.ok(appointmentService.getAppointmentsBetweenDates(start, end));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        // User thường luôn đặt lịch cho chính mình; ADMIN có thể đặt hộ khách
        User requester = currentUser.require();
        if (!currentUser.isAdmin()) {
            appointment.setCustomerId(requester.getId());
        }

        // Validation
        if (appointment.getCustomerId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ID khách hàng không được để trống"));
        }
        if (appointment.getStaffId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "ID nhân viên không được để trống"));
        }
        if (appointment.getAppointmentDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ngày hẹn không được để trống"));
        }
        if (appointment.getReason() == null || appointment.getReason().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lý do hẹn không được để trống"));
        }

        try {
            Appointment createdAppointment = appointmentService.createAppointment(appointment);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đặt lịch hẹn thành công");
            response.put("appointment", createdAppointment);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointment) {
        Appointment updatedAppointment = appointmentService.updateAppointment(id, appointment);
        if (updatedAppointment != null) {
            return ResponseEntity.ok(updatedAppointment);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Appointment.AppointmentStatus appointmentStatus = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
            Appointment existing = appointmentService.getAppointmentById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }
            User requester = currentUser.require();
            if (!currentUser.isAdmin()) {
                if (!existing.getCustomerId().equals(requester.getId())) {
                    throw new ForbiddenException("Không có quyền thay đổi lịch hẹn này");
                }
                if (appointmentStatus != Appointment.AppointmentStatus.CANCELLED) {
                    throw new ForbiddenException("Bạn chỉ có thể hủy lịch hẹn của mình");
                }
            }
            Appointment updatedAppointment = appointmentService.updateAppointmentStatus(id, appointmentStatus);
            return ResponseEntity.ok(updatedAppointment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}