package com.medilens.app.service.imp;

import com.medilens.app.model.User;
import com.medilens.app.repository.UserRepository;
import com.medilens.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class UserDetailsServiceImp implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = (User) userRepository.getUserByEmail(email)
                .orElseThrow(
                () -> new UsernameNotFoundException("User not found")
        );
        return new MyUserDetails(user);
    }
}
