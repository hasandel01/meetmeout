package com.hasandel01.meetmeoutserver.user.controller;


import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @PutMapping("/me/profile-picture")
    public ResponseEntity<String> updateProfilePicture(@RequestParam(name = "profilePicture") MultipartFile file) {
        return ResponseEntity.ok(userService.updateProfilePicture(file));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @PostMapping("/me/update")
    public ResponseEntity<UserDTO> updateUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateMe(userDTO));
    }


}
