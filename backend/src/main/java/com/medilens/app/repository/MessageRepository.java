package com.PrescribeCorrect.app.repository;

import com.PrescribeCorrect.app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
