package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.JoinRequestDTO;
import com.hasandel01.meetmeoutserver.models.JoinEventRequest;

public class JoinRequestMapper {

    public static JoinRequestDTO toJoinRequestDTO(JoinEventRequest joinEventRequest) {

        return JoinRequestDTO.builder()
                .eventId(joinEventRequest.getEvent().getId())
                .user(UserMapper.toUserDTO(joinEventRequest.getSender()))
                .build();

    }
}
