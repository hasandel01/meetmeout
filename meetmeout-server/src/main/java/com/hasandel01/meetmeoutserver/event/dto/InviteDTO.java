package com.hasandel01.meetmeoutserver.event.dto;

import lombok.Builder;

@Builder
public record InviteDTO(
        Long id,
        Long eventId,
        Long senderId,
        Long receiverId,
        boolean status,
        String token
) {
}
