package com.medilens.app.controller;

import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.model.Message;
import com.medilens.app.repository.ChatRepository;
import com.medilens.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/create")
    public ResponseEntity<?> createChat(Authentication auth) {
        return new ResponseEntity<>(chatService.create(auth.getName()), HttpStatus.CREATED);
    }

    @PostMapping("/{id}") // insert message into chat
    public ResponseEntity<?> updateChat(@PathVariable Long id, @RequestBody Message message) throws NotFoundException {

        return new ResponseEntity<>(chatService.updateChat(id, message), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getChat(@PathVariable Long id) throws NotFoundException {
        return ResponseEntity.ok(chatService.getChatById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChat(@PathVariable Long id) {
        chatService.delete(id);
        return ResponseEntity.ok().build();
    }
}
