package com.medilens.app.service.imp;

import com.medilens.app.DTO.ChatDTO;
import com.medilens.app.DTO.UserDTO;
import com.medilens.app.exception.NotFoundException;
import com.medilens.app.model.Chat;
import com.medilens.app.model.Role;
import com.medilens.app.model.User;
import com.medilens.app.repository.UserRepository;
import com.medilens.app.service.ChatService;
import com.medilens.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImp implements UserService {

    UserDTO convertUserDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        return userDTO;
    }

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDTO getUserByEmail(String email) throws NotFoundException {
        User user = userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException("user not found with this email ..."));
        return convertUserDTO(user);
    }

    @Override
    public UserDTO save(User user) {
        if (userRepository.getUserByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account already exists with this email ...");
        }

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        User result = userRepository.save(user);
        return convertUserDTO(result);
    }

    @Override
    public List<UserDTO> findAll() {
        List<User> users = userRepository.findByRole(Role.ROLE_USER);
        return users.stream().map(this::convertUserDTO).toList();
    }

    @Override
    public void delete(String email) throws NotFoundException {
        User user = userRepository.getUserByEmail(email)
                        .orElseThrow(() -> new NotFoundException("user not found ..."));
        userRepository.delete(user);
    }

    @Override
    public UserDTO update(User user) {
        User useredited = userRepository.save(user);
        return convertUserDTO(useredited);
    }

    @Autowired
    private ChatServiceImp chatService;

    @Override
    public List<ChatDTO> getAllChats(String email) throws NotFoundException {
        User user = userRepository.findByEmailWithChats(email)
                .orElseThrow(() -> new NotFoundException("user not found ..."));

        List<ChatDTO> chatsDTO = user.getChats().stream()
                .sorted(Comparator.comparing(Chat::getCreatedAt).reversed()) // sort newest first
                .map(chatService::convertChatDTO)
                .peek(chatDTO -> chatDTO.setMessages(null))
                .toList();

        return chatsDTO;
    }

}
