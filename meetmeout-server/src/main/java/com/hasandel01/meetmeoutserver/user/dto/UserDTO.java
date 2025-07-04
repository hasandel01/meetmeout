package com.hasandel01.meetmeoutserver.user.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Set;

@Builder
public record UserDTO(
        Long id,
        String username,
        String firstName,
        String lastName,
        String email,
        String phone,
        String profilePictureUrl,
        String about,
        Set<UserDTO> companions,
        Set<Long> participatedEventIds,
        Set<Long> organizedEventIds,
        Set<BadgeDTO> badges,
        boolean showLocation,
        boolean darkMode,
        LocalDateTime createdAt,
        Set<CarDTO> cars,
        double userLatitude,
        double userLongitude) {
}
