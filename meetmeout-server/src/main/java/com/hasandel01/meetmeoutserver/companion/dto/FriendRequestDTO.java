package com.hasandel01.meetmeoutserver.companion.dto;

import com.hasandel01.meetmeoutserver.companion.model.FriendRequest;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;

@Builder
public record FriendRequestDTO(
        Long id,
        UserDTO sender,
        UserDTO receiver,
        FriendRequest.Status status
) {
}
