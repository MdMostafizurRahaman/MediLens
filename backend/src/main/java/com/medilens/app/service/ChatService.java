package com.medilens.app.service;

import com.medilens.app.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;

public interface ChatService {
    Long create(String email);
}
