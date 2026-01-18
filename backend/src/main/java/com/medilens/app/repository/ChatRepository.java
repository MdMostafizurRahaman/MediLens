package com.PrescribeCorrect.app.repository;

import com.PrescribeCorrect.app.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> getChatById(Long id);
}
