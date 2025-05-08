package com.hasandel01.meetmeoutserver.event.mapper;


import com.hasandel01.meetmeoutserver.event.dto.EventChatMessageDTO;
import com.hasandel01.meetmeoutserver.event.model.EventChatMessage;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

public class EventChatMessageMapper {


    public static EventChatMessageDTO toEventChatMessageDTO(EventChatMessage eventChatMessage) {

        return EventChatMessageDTO.builder()
                .message(eventChatMessage.getMessage())
                .user(UserMapper.toUserDTO(eventChatMessage.getSender()))
                .build();

    }
}
