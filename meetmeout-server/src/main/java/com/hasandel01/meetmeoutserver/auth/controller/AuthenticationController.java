package com.hasandel01.meetmeoutserver.auth.controller;

import com.hasandel01.meetmeoutserver.auth.model.*;
import com.hasandel01.meetmeoutserver.auth.service.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> registerUser(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authenticationService.register(registerRequest));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest authenticationRequest,
                                          HttpServletResponse response) {

        AuthenticationResponse authResponse = authenticationService.authenticate(authenticationRequest);

        Cookie clearAccessToken = new Cookie("jwt", "");
        clearAccessToken.setHttpOnly(true);
        clearAccessToken.setSecure(true);
        clearAccessToken.setPath("/");
        clearAccessToken.setMaxAge(0);
        response.addCookie(clearAccessToken);

        Cookie clearRefreshToken = new Cookie("refresh", "");
        clearRefreshToken.setHttpOnly(true);
        clearRefreshToken.setSecure(true);
        clearRefreshToken.setPath("/");
        clearRefreshToken.setMaxAge(0);
        response.addCookie(clearRefreshToken);

        Cookie accessTokenCookie = new Cookie("jwt", authResponse.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(7 * 24 * 60 * 60);

        Cookie refreshTokenCookie = new Cookie("refresh", authResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(30 * 24 * 60 * 60);

        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok("Login successful");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        return ResponseEntity.ok(authenticationService.verifyEmail(token));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        RefreshResponse refreshResponse = authenticationService.validateRefreshToken(request);

        Cookie newAccessTokenCookie = new Cookie("jwt", refreshResponse.getAccessToken());
        newAccessTokenCookie.setHttpOnly(true);
        newAccessTokenCookie.setSecure(true);
        newAccessTokenCookie.setPath("/");
        newAccessTokenCookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(newAccessTokenCookie);

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
        Cookie clearAccessToken = new Cookie("jwt", "");
        clearAccessToken.setHttpOnly(true);
        clearAccessToken.setSecure(true);
        clearAccessToken.setPath("/");
        clearAccessToken.setMaxAge(0);

        Cookie clearRefreshToken = new Cookie("refresh", "");
        clearRefreshToken.setHttpOnly(true);
        clearRefreshToken.setSecure(true);
        clearRefreshToken.setPath("/");
        clearRefreshToken.setMaxAge(0);

        response.addCookie(clearAccessToken);
        response.addCookie(clearRefreshToken);

        return ResponseEntity.ok().build();
    }


}
