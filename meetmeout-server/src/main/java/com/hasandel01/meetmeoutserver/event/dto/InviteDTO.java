package com.hasandel01.meetmeoutserver.event.dto;

import com.hasandel01.meetmeoutserver.enums.InviteStatus;

import java.time.LocalDateTime;

public record InviteDTO(
        Long id,
        Long eventId,
        Long senderId,
        Long receiverId,
        InviteStatus status,
        LocalDateTime createdAt
) {
}
