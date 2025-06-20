package com.hasandel01.meetmeoutserver.auth.service;

import com.hasandel01.meetmeoutserver.auth.model.*;
import jakarta.servlet.http.HttpServletRequest;

import java.sql.Ref;

/**
 * Interface for handling user authentication and account-related operations.
 */
public interface AuthenticationService {

    /**
     * Registers a new user.
     *
     * @param registerRequest the registration request containing user details
     * @return an authentication response with JWT tokens
     */
    AuthenticationResponse register(RegisterRequest registerRequest);

    /**
     * Authenticates a user with username and password.
     *
     * @param authenticationRequest the authentication request
     * @return an authentication response with JWT tokens
     */
    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest);

    /**
     * Validates the provided refresh token and returns a new access token.
     *
     * @param request the refresh token request
     * @return an authentication response with a new access token
     */
    RefreshResponse validateRefreshToken(HttpServletRequest request);

    /**
     * Checks if a user exists based on the provided email.
     *
     * @param request the request containing the email to check
     * @return true if the user exists, false otherwise
     */
    Boolean checkUser(CheckUserRequest request);

    /**
     * Sends a password reset link to the specified email address.
     *
     * @param email the user's email
     * @return a message indicating the result
     */
    String sendPasswordResetLink(String email);

    /**
     * Resets the password using the provided token and new password.
     *
     * @param request the reset password request
     * @return a message indicating the result
     */
    String resetPassword(ResetPasswordRequest request);

    /**
     * Verifies the user's email using the provided token.
     *
     * @param token the verification token
     * @return a message indicating the result
     */
    String verifyEmail(String token);
}
