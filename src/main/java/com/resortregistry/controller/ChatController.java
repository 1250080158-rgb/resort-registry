package com.resortregistry.controller;

import com.resortregistry.entity.Chat;
import com.resortregistry.entity.User;
import com.resortregistry.repository.UserRepository;
import com.resortregistry.security.CurrentUser;
import com.resortregistry.security.ForbiddenException;
import com.resortregistry.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "*")
public class ChatController {
    private final ChatService chatService;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public ChatController(ChatService chatService, UserRepository userRepository, CurrentUser currentUser) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<Chat>> getAllChats() {
        requireAdmin();
        return ResponseEntity.ok(chatService.getAllChats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chat> getChatById(@PathVariable Long id) {
        requireAdmin();
        Chat chat = chatService.getChatById(id);
        if (chat != null) {
            return ResponseEntity.ok(chat);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/between/{customerId}/{staffId}")
    public ResponseEntity<List<Chat>> getChatsBetweenUsers(
            @PathVariable Long customerId,
            @PathVariable Long staffId) {
        requireParticipant(customerId, staffId);
        return ResponseEntity.ok(chatService.getChatsBetweenUsers(customerId, staffId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Chat>> getChatsByCustomerId(@PathVariable Long customerId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(customerId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem tin nhắn của chính mình");
        }
        return ResponseEntity.ok(chatService.getChatsByCustomerId(customerId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<Chat>> getChatsByStaffId(@PathVariable Long staffId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(staffId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem tin nhắn của chính mình");
        }
        return ResponseEntity.ok(chatService.getChatsByStaffId(staffId));
    }

    @GetMapping("/customer/{customerId}/unread")
    public ResponseEntity<List<Chat>> getUnreadChatsForCustomer(@PathVariable Long customerId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(customerId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem tin nhắn của chính mình");
        }
        return ResponseEntity.ok(chatService.getUnreadChatsForCustomer(customerId));
    }

    @GetMapping("/staff/{staffId}/unread")
    public ResponseEntity<List<Chat>> getUnreadChatsForStaff(@PathVariable Long staffId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(staffId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ được xem tin nhắn của chính mình");
        }
        return ResponseEntity.ok(chatService.getUnreadChatsForStaff(staffId));
    }

    /**
     * Tìm nhân viên hỗ trợ cho khách (ADMIN trước, không có thì lấy STAFF đầu tiên).
     */
    @GetMapping("/support")
    public ResponseEntity<User> getSupportStaff() {
        currentUser.require();
        List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);
        if (!admins.isEmpty()) {
            return ResponseEntity.ok(admins.get(0));
        }
        List<User> staff = userRepository.findByRole(User.UserRole.STAFF);
        if (!staff.isEmpty()) {
            return ResponseEntity.ok(staff.get(0));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Chat chat) {
        User requester = currentUser.require();
        if (chat.getCustomerId() == null || chat.getStaffId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin cuộc trò chuyện"));
        }
        requireParticipant(chat.getCustomerId(), chat.getStaffId());
        // Người gửi luôn là người đang đăng nhập, không nhận từ client
        chat.setSenderId(requester.getId());

        if (chat.getMessage() == null || chat.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tin nhắn không được để trống"));
        }

        try {
            Chat sentChat = chatService.sendMessage(chat);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Gửi tin nhắn thành công");
            response.put("chat", sentChat);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Chat> markAsRead(@PathVariable Long id) {
        Chat chat = chatService.markAsRead(id);
        if (chat != null) {
            return ResponseEntity.ok(chat);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/between/{customerId}/{staffId}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable Long customerId,
            @PathVariable Long staffId) {
        requireParticipant(customerId, staffId);
        chatService.markAllAsRead(customerId, staffId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đã đánh dấu tất cả tin nhắn là đã đọc");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long id) {
        requireAdmin();
        chatService.deleteChat(id);
        return ResponseEntity.noContent().build();
    }

    private void requireParticipant(Long customerId, Long staffId) {
        User requester = currentUser.require();
        if (!requester.getId().equals(customerId) && !requester.getId().equals(staffId) && !currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ người tham gia cuộc trò chuyện mới được truy cập");
        }
    }

    private void requireAdmin() {
        if (!currentUser.isAdmin()) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền thực hiện thao tác này");
        }
    }
}
