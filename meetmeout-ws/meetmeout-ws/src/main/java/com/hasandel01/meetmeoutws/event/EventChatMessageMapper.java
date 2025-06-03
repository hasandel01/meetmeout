package com.hasandel01.meetmeoutws.event;

import com.hasandel01.meetmeoutws.user.UserMapper;

public class EventChatMessageMapper {


    public static EventChatMessageDTO toEventChatMessageDTO(EventChatMessage eventChatMessage) {

        return EventChatMessageDTO.builder()
                .message(eventChatMessage.getMessage())
                .user(UserMapper.toUserDTO(eventChatMessage.getSender()))
                .build();

    }
}
