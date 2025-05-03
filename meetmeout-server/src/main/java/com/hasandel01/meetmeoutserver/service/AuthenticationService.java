package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.controller.AuthenticationController;
import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import com.hasandel01.meetmeoutserver.models.AuthenticationRequest;
import com.hasandel01.meetmeoutserver.models.AuthenticationResponse;
import com.hasandel01.meetmeoutserver.models.RegisterRequest;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.cert.CertPathBuilder;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    @Value("${profile.pictureUrl}")
    private String publicUrl;

    public AuthenticationResponse register(RegisterRequest registerRequest) {

        User user = userRepository.findByEmail(registerRequest.getEmail()).orElse(null);

        if(user != null) {
            throw new UserIsRegisteredException("User with " +
                    registerRequest.getEmail() + " is already registered.");
        } else {

            user = User.builder()
                    .username(registerRequest.getUsername())
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .email(registerRequest.getEmail())
                    .profilePictureUrl(publicUrl)
                    .bio("")
                    .build();

            userRepository.save(user);
        }

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.getUsername(),
                        authenticationRequest.getPassword()
                )
        );
        var user = userRepository.findByUsername(authenticationRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException(authenticationRequest.getUsername()));

        var jwtToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public UserDTO update(UserDTO userDTO) {

        User user = userRepository.findByEmail(userDTO.firstName()).orElseThrow(
                () -> new UsernameNotFoundException("User not found")
        );

        user.setEmail(userDTO.email());
        user.setUsername(userDTO.username());
        user.setFirstName(userDTO.firstName());
        user.setLastName(userDTO.lastName());
        user.setProfilePictureUrl(userDTO.profilePictureUrl());
        userRepository.save(user);
        return UserDTO.builder()
                .username(userDTO.username())
                .firstName(userDTO.firstName())
                .lastName(userDTO.lastName())
                .email(userDTO.email())
                .phone(userDTO.phone())
                .bio(userDTO.bio())
                .profilePictureUrl(userDTO.profilePictureUrl())
                .build();
    }

}
