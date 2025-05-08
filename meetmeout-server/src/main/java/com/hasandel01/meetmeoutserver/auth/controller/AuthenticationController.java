package com.hasandel01.meetmeoutserver.auth.controller;

import com.hasandel01.meetmeoutserver.auth.model.AuthenticationRequest;
import com.hasandel01.meetmeoutserver.auth.model.AuthenticationResponse;
import com.hasandel01.meetmeoutserver.auth.model.RegisterRequest;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            return ResponseEntity.ok(authenticationService.register(registerRequest));
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest authenticationRequest) {
        return ResponseEntity.ok(authenticationService.authenticate(authenticationRequest));
    }

    @PostMapping("/check-user")
    public ResponseEntity<Boolean> checkUser(@RequestBody Map<String , String> payload) {
        try {
            return ResponseEntity.ok(authenticationService.checkUser(payload));
        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified");
    }


    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResponse> getRefreshToken(@RequestBody Map<String, String> payload) {
        try {
            return ResponseEntity.ok(authenticationService.validateRefreshToken(payload.get("refreshToken")));
        }catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/send-password-reset-link/{email}")
    public ResponseEntity<Void> sendPasswordResetLink(@PathVariable String email) {
        try {
            return ResponseEntity.ok(authenticationService.sendPasswordResetLink(email));
        }catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody Map<String, String> payload) {
        try {
            return ResponseEntity.ok(authenticationService.resetPassword(payload));
        }catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


}
