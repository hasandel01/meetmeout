package com.hasandel01.meetmeoutws.user;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record BadgeDTO(
        Long id,
        String title,
        String description,
        String iconUrl,
        LocalDateTime createdAt
) {
}
