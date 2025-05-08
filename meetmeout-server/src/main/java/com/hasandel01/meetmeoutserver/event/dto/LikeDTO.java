package com.hasandel01.meetmeoutserver.event.dto;

import lombok.Builder;

@Builder
public record LikeDTO(
        long id,
        String username,
        long eventId)
{
}
