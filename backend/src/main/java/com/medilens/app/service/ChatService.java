package com.PrescribeCorrect.app.service;

import com.PrescribeCorrect.app.dto.ChatDTO;
import com.PrescribeCorrect.app.exception.NotFoundException;
import com.PrescribeCorrect.app.model.Chat;
import com.PrescribeCorrect.app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;

public interface ChatService {
    Long create(String email);

    ChatDTO getChatById(Long id) throws NotFoundException;

    Long updateChat(Long id, Message message) throws NotFoundException;

    void delete(Long id);
}
