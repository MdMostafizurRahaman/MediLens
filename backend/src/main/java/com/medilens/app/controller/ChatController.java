package com.medilens.app.controller;

import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/create")
    public ResponseEntity<?> createChat(Authentication auth) {
        return new ResponseEntity<>(chatService.create(auth.getName()), HttpStatus.CREATED);
    }
}
