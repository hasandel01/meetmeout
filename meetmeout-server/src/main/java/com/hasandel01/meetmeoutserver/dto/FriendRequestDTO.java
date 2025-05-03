package com.hasandel01.meetmeoutserver.dto;

import com.hasandel01.meetmeoutserver.models.FriendRequest;
import com.hasandel01.meetmeoutserver.models.User;
import lombok.Builder;

@Builder
public record FriendRequestDTO(
        Long id,
        User sender,
        User receiver,
        FriendRequest.Status status
) {
}
