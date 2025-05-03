package com.hasandel01.meetmeoutserver.controller;


import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.mappers.UserMapper;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import com.hasandel01.meetmeoutserver.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.service.CompanionService;
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

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class UserController {

    private final UserDetailsService userDetailsService;

    private final CloudStorageService cloudStorageService;

    private final UserRepository userRepository;
    private final CompanionService companionService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = (User) userDetailsService.loadUserByUsername(username);
        return ResponseEntity.ok(UserMapper.toUserDTO(user));
    }

    @PostMapping("update/profile-picture")
    public ResponseEntity<String> updateProfilePicture(@RequestParam(name = "profilePicture") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = (User) userDetailsService.loadUserByUsername(username);

        String imageUrl = cloudStorageService.uploadProfilePicture(file);
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok("Profile picture updated");
    }


    @GetMapping("/{username}")
    public ResponseEntity<UserDTO> getUser(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return ResponseEntity.ok(UserMapper.toUserDTO(user));
    }


    @GetMapping("/all-users-except-companions")
    public ResponseEntity<List<UserDTO>> getAllUsersExceptCompanions() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = (User) userDetailsService.loadUserByUsername(username);

        List<User> users = userRepository.findAll();

        List<UserDTO> companions = companionService.getFriends(currentUser.getEmail());

        Set<Long> companionIds = companions.stream().map(UserDTO::id).collect(Collectors.toSet());


        List<UserDTO> filteredUsers = users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !companionIds.contains(user.getId()))
                .map(UserMapper::toUserDTO)
                .toList();

        return ResponseEntity.ok(filteredUsers);
    }

}
