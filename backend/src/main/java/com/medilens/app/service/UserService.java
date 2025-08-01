package com.medilens.app.service;

import com.medilens.app.DTO.ChatDTO;
import com.medilens.app.DTO.UserDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.model.User;

import java.util.List;

public interface UserService {
    UserDTO getUserByEmail(String email) throws NotFoundException;

    UserDTO save(User user) ;

    List<UserDTO> findAll();

    void delete(String email) throws NotFoundException;

    UserDTO update(User user);

    List<ChatDTO> getAllChats(String email) throws NotFoundException;
}
