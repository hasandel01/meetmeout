package com.hasandel01.meetmeoutserver.user.dto;


import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserReviewDTO (
        Long id,
        String review,
        int rating,
        UserDTO organizer,
        UserDTO reviewer,
        EventDTO event,
        LocalDateTime createdAt
)
{
}
