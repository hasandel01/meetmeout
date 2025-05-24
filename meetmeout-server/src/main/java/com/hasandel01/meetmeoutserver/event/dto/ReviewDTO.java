package com.hasandel01.meetmeoutserver.event.dto;

import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.user.model.User;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ReviewDTO (
    Long reviewId,
    UserDTO reviewer,
    String content,
    LocalDateTime updatedAt,
    int rating
) {

}
