package com.hasandel01.meetmeoutserver.event.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ReviewDTO (
    Long reviewerId,
    String title,
    String content,
    LocalDateTime updatedAt,
    int rating
) {

}
