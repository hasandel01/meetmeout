package com.hasandel01.meetmeoutserver.controller;


import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import com.hasandel01.meetmeoutserver.models.AuthenticationRequest;
import com.hasandel01.meetmeoutserver.models.AuthenticationResponse;
import com.hasandel01.meetmeoutserver.models.RegisterRequest;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import com.hasandel01.meetmeoutserver.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

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
        catch (UserIsRegisteredException e) {
            return ResponseEntity.ok().body(AuthenticationResponse.builder().token(e.getMessage()).build());
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
    public ResponseEntity<?> checkUser(@RequestBody Map<String , String> payload) {

        try {
            String email = payload.get("email");

            if(email == null || email.isEmpty())
                return ResponseEntity.badRequest().body("Email is required.");

            Optional<User> user = userRepository.findByEmail(email);

            if(user.isPresent())
                return ResponseEntity.ok().build();
            else
                return ResponseEntity.notFound().build();

        } catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }


}
