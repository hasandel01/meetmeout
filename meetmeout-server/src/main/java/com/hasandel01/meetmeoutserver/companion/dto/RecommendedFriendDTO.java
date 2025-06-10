package com.hasandel01.meetmeoutserver.companion.dto;

import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;

import java.util.List;

@Builder
public record RecommendedFriendDTO (
        UserDTO user,
        List<UserDTO> mutualFriends,
        List<EventDTO> sharedEvents,
        String reason,
        int priority
){
}
