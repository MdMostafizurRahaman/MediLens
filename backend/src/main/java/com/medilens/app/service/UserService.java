package com.medilens.app.service;

import com.medilens.app.DTO.ChatDTO;
import com.medilens.app.DTO.UserDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.model.User;
import org.apache.coyote.BadRequestException;

import java.util.List;

public interface UserService {
    UserDTO getUserByEmail(String email) throws NotFoundException, BadRequestException;
    UserDTO getAdminByEmail(String email) throws NotFoundException, BadRequestException;

    UserDTO save(User user) ;

    List<UserDTO> findAllUsers();
    List<UserDTO> findAllAdmin();

    void delete(String email) throws NotFoundException;

    UserDTO update(User user);

    List<ChatDTO> getAllChats(String email) throws NotFoundException;


}
