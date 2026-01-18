package com.PrescribeCorrect.app.service;

import com.PrescribeCorrect.app.dto.ChatDTO;
import com.PrescribeCorrect.app.dto.UserDTO;
import com.PrescribeCorrect.app.exception.NotFoundException;
import com.PrescribeCorrect.app.model.Chat;
import com.PrescribeCorrect.app.model.User;
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
