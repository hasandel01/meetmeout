package com.hasandel01.meetmeoutserver.dto;

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
        String bio,
        Set<UserDTO> companions,
        Set<EventDTO> events) {
}
