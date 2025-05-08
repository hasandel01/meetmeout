package com.hasandel01.meetmeoutserver.companion;

import com.hasandel01.meetmeoutserver.user.model.User;
import lombok.Builder;

@Builder
public record FriendRequestDTO(
        Long id,
        User sender,
        User receiver,
        FriendRequest.Status status
) {
}
