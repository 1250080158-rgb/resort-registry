package com.resortregistry.service;

import com.resortregistry.entity.Chat;
import com.resortregistry.entity.User;
import com.resortregistry.repository.ChatRepository;
import com.resortregistry.exception.BusinessException;
import com.resortregistry.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public ChatService(ChatRepository chatRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    public List<Chat> getAllChats() {
        return chatRepository.findAll();
    }

    public Chat getChatById(Long id) {
        return chatRepository.findById(id).orElse(null);
    }

    public List<Chat> getChatsBetweenUsers(Long customerId, Long staffId) {
        return chatRepository.findByCustomerIdAndStaffIdOrderByCreatedAtAsc(customerId, staffId);
    }

    public List<Chat> getChatsByCustomerId(Long customerId) {
        return chatRepository.findByCustomerId(customerId);
    }

    public List<Chat> getChatsByStaffId(Long staffId) {
        return chatRepository.findByStaffId(staffId);
    }

    public List<Chat> getUnreadChatsForCustomer(Long customerId) {
        return chatRepository.findByCustomerIdAndIsReadFalse(customerId);
    }

    public List<Chat> getUnreadChatsForStaff(Long staffId) {
        return chatRepository.findByStaffIdAndIsReadFalse(staffId);
    }

    public Chat sendMessage(Chat chat) {
        // Validate users exist
        User customer = userRepository.findById(chat.getCustomerId()).orElse(null);
        User staff = userRepository.findById(chat.getStaffId()).orElse(null);
        User sender = userRepository.findById(chat.getSenderId()).orElse(null);

        if (customer == null) {
            throw new BusinessException("Khách hàng không tồn tại");
        }
        if (staff == null) {
            throw new BusinessException("Nhân viên không tồn tại");
        }
        if (sender == null) {
            throw new BusinessException("Người gửi không tồn tại");
        }

        // Validate sender is either customer or staff
        if (!sender.getId().equals(customer.getId()) && !sender.getId().equals(staff.getId())) {
            throw new BusinessException("Người gửi không tham gia cuộc trò chuyện này");
        }

        // Set sender info
        chat.setSenderName(sender.getName());
        chat.setSenderRole(sender.getRole().toString());

        // Set default isRead to false
        if (chat.getIsRead() == null) {
            chat.setIsRead(false);
        }

        return chatRepository.save(chat);
    }

    public Chat markAsRead(Long chatId) {
        Chat chat = chatRepository.findById(chatId).orElse(null);
        if (chat != null) {
            chat.setIsRead(true);
            return chatRepository.save(chat);
        }
        return null;
    }

    public void deleteChat(Long id) {
        chatRepository.deleteById(id);
    }

    public void markAllAsRead(Long customerId, Long staffId) {
        List<Chat> chats = chatRepository.findByCustomerIdAndStaffId(customerId, staffId);
        for (Chat chat : chats) {
            chat.setIsRead(true);
            chatRepository.save(chat);
        }
    }
}