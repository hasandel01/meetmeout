package com.hasandel01.meetmeoutserver.dto;

import lombok.Builder;


@Builder
public record JoinRequestDTO(
        UserDTO user,
        Long eventId
) {

}
