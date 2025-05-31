package com.hasandel01.meetmeoutserver.user.dto;


import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserReviewDTO (
        Long id,
        String review,
        int rating,
        UserDTO user,
        UserDTO reviewer,
        LocalDateTime createdAt
)
{
}
