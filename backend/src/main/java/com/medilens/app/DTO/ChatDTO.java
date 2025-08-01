package com.medilens.app.DTO;

import com.medilens.app.model.ChatRole;
import com.medilens.app.model.Message;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ChatDTO {
    Long id;
    List<Message> messages;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
