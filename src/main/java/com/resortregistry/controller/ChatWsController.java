package com.resortregistry.controller;

import com.resortregistry.entity.Chat;
import com.resortregistry.entity.User;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.UserRepository;
import com.resortregistry.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

/**
 * Nhận tin nhắn chat qua WebSocket (STOMP) và phát lại cho cả hai bên
 * tại /topic/chat/{customerId}/{staffId}. senderId lấy từ JWT ở handshake —
 * client không thể giả mạo người gửi.
 */
@Controller
public class ChatWsController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWsController(ChatService chatService, UserRepository userRepository,
                            SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /** Payload client gửi tới /app/chat.send: {"customerId":1, "staffId":5, "message":"xin chào"} */
    @MessageMapping("/chat.send")
    public void send(Map<String, Object> payload, SimpMessageHeaderAccessor accessor) {
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        String email = sessionAttributes != null ? (String) sessionAttributes.get("email") : null;
        if (email == null) {
            throw new BusinessException("Chưa đăng nhập");
        }
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Người gửi không tồn tại"));

        Long customerId = toLong(payload.get("customerId"));
        Long staffId = toLong(payload.get("staffId"));
        String message = payload.get("message") != null ? payload.get("message").toString().trim() : "";
        if (customerId == null || staffId == null || message.isEmpty()) {
            throw new BusinessException("Thiếu thông tin tin nhắn");
        }

        Chat chat = new Chat();
        chat.setCustomerId(customerId);
        chat.setStaffId(staffId);
        chat.setSenderId(sender.getId());
        chat.setMessage(message);

        Chat saved = chatService.sendMessage(chat); // validate người gửi thuộc cuộc trò chuyện
        messagingTemplate.convertAndSend("/topic/chat/" + customerId + "/" + staffId, saved);
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        try {
            return Long.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
