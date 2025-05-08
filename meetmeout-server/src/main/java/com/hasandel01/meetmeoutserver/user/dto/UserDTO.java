package com.hasandel01.meetmeoutserver.user.dto;

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
        Set<BadgeDTO> badges) {
}
