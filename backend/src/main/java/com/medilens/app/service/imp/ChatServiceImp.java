package com.medilens.app.service.imp;

import com.medilens.app.dto.ChatDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.model.Message;
import com.medilens.app.model.User;
import com.medilens.app.repository.ChatRepository;
import com.medilens.app.repository.MessageRepository;
import com.medilens.app.repository.UserRepository;
import com.medilens.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
public class ChatServiceImp implements ChatService {

    ChatDTO convertChatDTO(Chat chat) {
        ChatDTO chatDTO = new ChatDTO();
        chatDTO.setId(chat.getId());
        chatDTO.setName(chat.getName());
        chatDTO.setMessages(
                chat.getMessages().stream()
                        .peek(m -> m.setChat(null))
                        .toList()
        );
        chatDTO.setCreatedAt(chat.getCreatedAt());
        chatDTO.setUpdatedAt(chat.getUpdatedAt());
        return chatDTO;
    }

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Long create(String email) {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return chatRepository.save(new Chat(user)).getId();
    }

    @Override
    public ChatDTO getChatById(Long id) throws NotFoundException {
        Chat chat = chatRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chat not found with this id ..."));
        chat.getMessages().sort((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()));
        return  convertChatDTO(chat);
    }

    @Override
    public Long updateChat(Long id, Message message) throws NotFoundException {
        Chat chat = chatRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chat not found with this id ..."));
        chat.setUpdatedAt(LocalDateTime.now());
        if(chat.getName() == null) {
            chat.setName(message.getMessage());
        }
        message.setChat(chat);
        return messageRepository.save(message).getId();
    }

    @Override
    public void delete(Long id) {
        chatRepository.deleteById(id);
    }
}
