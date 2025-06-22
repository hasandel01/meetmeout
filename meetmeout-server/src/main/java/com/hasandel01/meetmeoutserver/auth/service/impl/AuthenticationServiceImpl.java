package com.hasandel01.meetmeoutserver.auth.service.impl;

import com.hasandel01.meetmeoutserver.auth.model.*;
import com.hasandel01.meetmeoutserver.auth.service.AuthenticationService;
import com.hasandel01.meetmeoutserver.auth.service.JwtService;
import com.hasandel01.meetmeoutserver.common.service.EmailSenderService;
import com.hasandel01.meetmeoutserver.exceptions.EmailNotFoundException;
import com.hasandel01.meetmeoutserver.exceptions.InvalidTokenException;
import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailSenderService emailSenderService;

    @Value("${profile.pictureUrl}")
    private String defaultProfilePictureUrl;

    @Value("${app.frontend.url}")
    private String baseUrl;


    public void register(RegisterRequest registerRequest) {

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
                    .profilePictureUrl(defaultProfilePictureUrl)
                    .about("")
                    .verificationToken(verificationToken)
                    .emailVerified(false)
                    .darkMode(false)
                    .showLocation(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            emailSenderService.sendEmail(user.getEmail(), "Please verify your email",
                    "Click the link to verify your account: " + baseUrl + "/verify?token=" + verificationToken);
            userRepository.save(user);
        }

        jwtService.generateToken(user);
        jwtService.generateRefreshToken(user);
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

    public Boolean checkUser(CheckUserRequest request) {

        if(request.getEmail() == null || request.getEmail().isEmpty()) return false;

        Optional<User> user = userRepository.findByEmail(request.getEmail());

        return user.isPresent();
    }

    public RefreshResponse validateRefreshToken(HttpServletRequest request) {

        String refreshToken = null;

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            throw new InvalidTokenException("Refresh token is missing in cookies");
        }

        String username = jwtService.getSubject(refreshToken);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        var newAccessToken = jwtService.generateToken(user);

        return RefreshResponse.builder()
                .accessToken(newAccessToken)
                .build();
    }


    public String sendPasswordResetLink(String email) {

        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new EmailNotFoundException("User not found with email: " + email));

        String resetPasswordToken = UUID.randomUUID().toString();

        user.setResetPasswordToken(resetPasswordToken);

        userRepository.save(user);
        emailSenderService.sendEmail(user.getEmail(),
                "Password reset link",
                "Click the link to reset your password: " + baseUrl + "/reset-password?token=" + resetPasswordToken);


        return "Password reset link sent to your email.";
    }

    public String resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByResetPasswordToken(request.getResetPasswordToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid token. User not found!"));

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetPasswordToken("");
        userRepository.save(user);
        return null;

    }

    public String verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid token. User not found!"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return"Email verified";
    }

    @Override
    public Boolean checkUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElse(null);


        if(user == null) return false;

        return user.getUsername().equals(username);
    }
}
