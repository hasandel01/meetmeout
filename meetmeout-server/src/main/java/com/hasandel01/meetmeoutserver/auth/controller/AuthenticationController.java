package com.hasandel01.meetmeoutserver.auth.controller;

import com.hasandel01.meetmeoutserver.auth.model.*;
import com.hasandel01.meetmeoutserver.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/check-user")
    public ResponseEntity<Boolean> checkUser(@RequestBody CheckUserRequest request) {
        return ResponseEntity.ok(authenticationService.checkUser(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> registerUser(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authenticationService.register(registerRequest));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest authenticationRequest) {
        return ResponseEntity.ok(authenticationService.authenticate(authenticationRequest));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        return ResponseEntity.ok(authenticationService.verifyEmail(token));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResponse> getRefreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authenticationService.validateRefreshToken(request));
    }


    @PostMapping("/send-password-reset-link/{email}")
    public ResponseEntity<String> sendPasswordResetLink(@PathVariable String email) {
        return ResponseEntity.ok(authenticationService.sendPasswordResetLink(email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authenticationService.resetPassword(request));
    }

}
