package com.hasandel01.meetmeoutserver.event.dto;

import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;


@Builder
public record JoinRequestDTO(
        UserDTO user,
        Long eventId
) {

}
