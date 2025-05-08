package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.JoinRequestDTO;
import com.hasandel01.meetmeoutserver.event.model.JoinEventRequest;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

public class JoinRequestMapper {

    public static JoinRequestDTO toJoinRequestDTO(JoinEventRequest joinEventRequest) {

        return JoinRequestDTO.builder()
                .eventId(joinEventRequest.getEvent().getId())
                .user(UserMapper.toUserDTO(joinEventRequest.getSender()))
                .build();

    }
}
