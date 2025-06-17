package com.hasandel01.meetmeoutserver.user.controller;


import com.hasandel01.meetmeoutserver.user.dto.*;
import com.hasandel01.meetmeoutserver.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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


    @PutMapping("/me/location-preference")
    public ResponseEntity<Boolean> updateLocationPreference(@RequestBody LocationDTO locationPreference) {
        return ResponseEntity.ok(userService.updateLocationPreference(locationPreference.showLocation()));
    }

    @PutMapping("/me/dark-mode")
    public ResponseEntity<Boolean> updateDarkMode(@RequestBody DarkModeDTO darkMode) {
        return ResponseEntity.ok(userService.updateDarkModePreference(darkMode.darkMode()));
    }

    @GetMapping("/{username}/average-rating")
    public ResponseEntity<Double> getAverageRatingForUser(@PathVariable String username) {
        return ResponseEntity.ok(userService.getAverageRating(username));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Boolean> deleteMe() {
        return ResponseEntity.ok(userService.deleteMyself());
    }


    @GetMapping("/top-travel-associates/{username}")
    public ResponseEntity<List<TravelAssociateDTO>> getTopTravelAssociates(@PathVariable String username) {
        return ResponseEntity.ok(userService.getTravelAssociates(username));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getUsersByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(userService.getUsersByIds(ids));
    }

    @PutMapping("/{userId}/location")
    public ResponseEntity<?> updateLocation(@PathVariable Long userId, @RequestBody UserLocationDTO locationDTO) {
            userService.updateUserLocation(userId, locationDTO.getLatitude(), locationDTO.getLongitude());
        return ResponseEntity.ok().build();
    }


}
