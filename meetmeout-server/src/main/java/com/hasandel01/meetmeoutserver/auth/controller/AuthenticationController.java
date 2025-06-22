package com.hasandel01.meetmeoutserver.auth.controller;

import com.hasandel01.meetmeoutserver.auth.model.*;
import com.hasandel01.meetmeoutserver.auth.service.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/exists")
    public ResponseEntity<Boolean> checkUser(@RequestBody CheckUserRequest request) {
        return ResponseEntity.ok(authenticationService.checkUser(request));
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateUsername(@RequestParam String username) {
        return ResponseEntity.ok(authenticationService.checkUsername(username));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        authenticationService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration was successfull.");
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest authenticationRequest,
                                          HttpServletResponse response) {
        AuthenticationResponse authResponse = authenticationService.authenticate(authenticationRequest);
        clearCookie(response, "jwt");
        clearCookie(response, "refresh");
        addCookie(response, "jwt", authResponse.getAccessToken(), 7 * 24 * 60 * 60);
        addCookie(response, "refresh", authResponse.getRefreshToken(), 30 * 24 * 60 * 60);

        return ResponseEntity.ok("Login successful");
    }


    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        return ResponseEntity.ok(authenticationService.verifyEmail(token));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        RefreshResponse refreshResponse = authenticationService.validateRefreshToken(request);
        addCookie(response, "jwt", refreshResponse.getAccessToken(), 7 * 24 * 60 * 60);
        return ResponseEntity.ok(refreshResponse);
    }



    @PostMapping("/password-reset-link")
    public ResponseEntity<String> sendPasswordResetLink(@RequestParam("email") String email) {
        return ResponseEntity.ok(authenticationService.sendPasswordResetLink(email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authenticationService.resetPassword(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        clearCookie(response, "jwt");
        clearCookie(response, "refresh");
        return ResponseEntity.ok().build();
    }


    private void addCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        String cookieString = String.format(
                "%s=%s; Max-Age=%d; Path=/; Secure; HttpOnly; SameSite=None",
                name, value, maxAgeSeconds
        );
        response.addHeader("Set-Cookie", cookieString);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        String cookieString = String.format(
                "%s=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=None",
                name
        );
        response.addHeader("Set-Cookie", cookieString);
    }



}