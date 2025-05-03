package com.hasandel01.meetmeoutserver.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record BadgeDTO(
        String title,
        String description,
        String iconUrl,
        LocalDateTime createdAt
) {
}
