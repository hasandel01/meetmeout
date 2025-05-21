package com.hasandel01.meetmeoutserver.event.dto;


import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Builder
public record CommentDTO(
    Long commentId,
    String comment,
    Long eventId,
    UserDTO sender,
    LocalDateTime updatedAt,
    LocalDateTime sentAt
) {
}
