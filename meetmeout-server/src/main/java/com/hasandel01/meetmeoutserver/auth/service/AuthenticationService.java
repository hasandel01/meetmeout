package com.hasandel01.meetmeoutserver.auth.service;

import com.hasandel01.meetmeoutserver.auth.model.*;

import java.util.Map;


public interface AuthenticationService {

    AuthenticationResponse register(RegisterRequest registerRequest);

    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest);

    Boolean checkUser(CheckUserRequest request);

    AuthenticationResponse validateRefreshToken(RefreshTokenRequest request);

    String sendPasswordResetLink(String email);

    String resetPassword(ResetPasswordRequest request);

    String verifyEmail(String token);
}
