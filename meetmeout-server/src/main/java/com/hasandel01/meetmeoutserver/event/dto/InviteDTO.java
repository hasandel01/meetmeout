package com.hasandel01.meetmeoutserver.event.dto;

import com.hasandel01.meetmeoutserver.enums.InviteStatus;
import com.hasandel01.meetmeoutserver.event.model.Invite;
import lombok.Builder;

@Builder
public record InviteDTO(
        Long id,
        Long eventId,
        Long senderId,
        Long receiverId,
        InviteStatus status,
        String token
) {

}
