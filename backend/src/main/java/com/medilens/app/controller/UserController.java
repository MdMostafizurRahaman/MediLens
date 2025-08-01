package com.medilens.app.controller;

import com.medilens.app.DTO.ChatDTO;
import com.medilens.app.DTO.UserDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.model.Role;
import com.medilens.app.model.User;
import com.medilens.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;


    @PostMapping("/sign-up")
    public ResponseEntity<?> singUp(@RequestBody User user) {
        user.setRole(Role.ROLE_USER);
        UserDTO createdUser = userService.save(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{email}")
    public ResponseEntity<UserDTO> getUser(@PathVariable String email) throws NotFoundException {

        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @PutMapping("/{email}")
    public ResponseEntity<?> updateUser(@PathVariable String email, @RequestBody User user) throws NotFoundException {
        user.setEmail(email);
        user.setRole(Role.ROLE_USER);
        return ResponseEntity.ok(userService.update(user));
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> deleteUser(@PathVariable String email) throws NotFoundException {
        userService.delete(email);
        return ResponseEntity.ok().build();
    }


    // for chat
    @GetMapping("/chat")
    public ResponseEntity<List<ChatDTO>> getAllChats(Authentication auth) throws NotFoundException {
        String email = auth.getName();
        return ResponseEntity.ok(userService.getAllChats(email));
    }
}
