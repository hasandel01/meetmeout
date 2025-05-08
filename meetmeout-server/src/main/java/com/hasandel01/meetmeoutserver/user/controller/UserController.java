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

    @PostMapping("/me/update")
    public ResponseEntity<UserDTO> updateUser(@RequestBody UserDTO userDTO) {
        try {
            return ResponseEntity.ok(userService.updateMe(userDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
