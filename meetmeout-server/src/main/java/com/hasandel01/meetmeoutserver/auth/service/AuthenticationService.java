package com.hasandel01.meetmeoutserver.auth.service;


import com.hasandel01.meetmeoutserver.common.service.EmailSenderService;
import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import com.hasandel01.meetmeoutserver.auth.model.AuthenticationRequest;
import com.hasandel01.meetmeoutserver.auth.model.AuthenticationResponse;
import com.hasandel01.meetmeoutserver.auth.model.RegisterRequest;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;
    private final EmailSenderService emailSenderService;

    @Value("${profile.pictureUrl}")
    private String publicUrl;

    public AuthenticationResponse register(RegisterRequest registerRequest) {

        User user = userRepository.findByEmail(registerRequest.getEmail()).orElse(null);

        if(user != null) {
            throw new UserIsRegisteredException("User with " +
                    registerRequest.getEmail() + " is already registered.");
        } else {

            String verificationToken = UUID.randomUUID().toString();

            user = User.builder()
                    .username(registerRequest.getUsername())
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .email(registerRequest.getEmail())
                    .profilePictureUrl(publicUrl)
                    .about("")
                    .verificationToken(verificationToken)
                    .emailVerified(false)
                    .build();

            emailSenderService.sendEmail(user.getEmail(), "Please verify your email",
                    "Click the link to verify your account: http://192.168.1.42:5173/verify?token=" + verificationToken);
            userRepository.save(user);
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(refreshToken).build();
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

        var jwtRefreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder().accessToken(jwtToken).refreshToken(jwtRefreshToken).build();
    }

    public Boolean   checkUser(Map<String, String> payload) {

        String email = payload.get("email");

        if(email == null || email.isEmpty())
            return false;

        Optional<User> user = userRepository.findByEmail(email);

        return user.isPresent();
    }

    public AuthenticationResponse validateRefreshToken(String refreshToken) {

        String username = jwtService.getSubject(refreshToken);

        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new UsernameNotFoundException("User not found"));

        if(!jwtService.isTokenValid(refreshToken, user)) {
            throw new RuntimeException("Invalid refresh token");
        }

        var newAccessToken = jwtService.generateToken(user);
        return AuthenticationResponse
                .builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }


    public Void sendPasswordResetLink(String email) {

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new UsernameNotFoundException("User not found"));

        String resetPasswordToken = UUID.randomUUID().toString();

        user.setResetPasswordToken(resetPasswordToken);

        userRepository.save(user);
        emailSenderService.sendEmail(user.getEmail(), "Password reset link",
                "Click the link to reset your password: http://192.168.1.42:5173/reset-password?token=" + resetPasswordToken);


        return null;
    }

    public Void resetPassword(Map<String, String> payload) {

        String password = payload.get("password");
        String resetPasswordToken = payload.get("resetPasswordToken");

        User user = userRepository.findByResetPasswordToken(resetPasswordToken)
                .orElseThrow(() -> new RuntimeException("Invalid token. User not found!"));

        log.info("Password: {}", password);

        user.setPassword(passwordEncoder.encode(password));
        user.setResetPasswordToken("");
        log.info("Password: {}", password);
        userRepository.save(user);
        return null;

    }
}
