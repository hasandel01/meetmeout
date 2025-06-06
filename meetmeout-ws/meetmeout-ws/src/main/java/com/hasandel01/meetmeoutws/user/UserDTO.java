package com.hasandel01.meetmeoutws.user;

import lombok.Builder;

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
        Set<UserReviewDTO> userReviews) {
}
