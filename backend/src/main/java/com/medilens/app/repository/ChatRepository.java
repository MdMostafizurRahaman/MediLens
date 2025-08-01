package com.medilens.app.repository;

import com.medilens.app.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> getChatById(Long id);
}
