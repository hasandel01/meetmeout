package com.hasandel01.meetmeoutserver.controller;


import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.mappers.UserMapper;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import com.hasandel01.meetmeoutserver.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.service.CompanionService;
import com.hasandel01.meetmeoutserver.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        try {
            return ResponseEntity.ok(userService.getMe());
        }catch(RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("update/profile-picture")
    public ResponseEntity<String> updateProfilePicture(@RequestParam(name = "profilePicture") MultipartFile file) {
        try {
            return ResponseEntity.ok(userService.updateProfilePicture(file));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        try {
            return ResponseEntity.ok(userService.getUserByUsername(username));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all-users-except-companions")
    public ResponseEntity<List<UserDTO>> getAllUsersExceptCompanions() {
        try {
            return ResponseEntity.ok(userService.getPossibleFriends());
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
