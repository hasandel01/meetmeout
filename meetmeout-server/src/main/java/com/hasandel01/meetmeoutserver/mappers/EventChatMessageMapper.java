package com.hasandel01.meetmeoutserver.mappers;


import com.hasandel01.meetmeoutserver.dto.EventChatMessageDTO;
import com.hasandel01.meetmeoutserver.models.EventChatMessage;
import com.hasandel01.meetmeoutserver.models.User;

public class EventChatMessageMapper {


    public static EventChatMessageDTO toEventChatMessageDTO(EventChatMessage eventChatMessage) {

        return EventChatMessageDTO.builder()
                .message(eventChatMessage.getMessage())
                .user(UserMapper.toUserDTO(eventChatMessage.getSender()))
                .build();

    }
}
