package com.medilens.app.service.imp;

import com.medilens.app.DTO.ChatDTO;
import com.medilens.app.model.Chat;
import com.medilens.app.model.User;
import com.medilens.app.repository.ChatRepository;
import com.medilens.app.repository.UserRepository;
import com.medilens.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatServiceImp implements ChatService {

    ChatDTO convertChatDTO(Chat chat) {
        ChatDTO chatDTO = new ChatDTO();
        chatDTO.setId(chat.getId());
        chatDTO.setMessages(chat.getMessages());
        chatDTO.setCreatedAt(chat.getCreatedAt());
        chatDTO.setUpdatedAt(chat.getUpdatedAt());
        return chatDTO;
    }

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Long create(String email) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return chatRepository.save(new Chat(user)).getId();
    }
}
