package com.hasandel01.meetmeoutserver.dto;

import lombok.Builder;
import lombok.Data;

@Builder
public record LikeDTO(
        long id,
        long userId,
        long eventId)
{
}
