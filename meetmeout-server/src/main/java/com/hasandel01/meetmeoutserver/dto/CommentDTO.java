package com.hasandel01.meetmeoutserver.dto;


import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record CommentDTO(
    Long commentId,
    String comment,
    Long userId,
    Long eventId,
    String username,
    LocalDateTime updatedAt
) {
}
