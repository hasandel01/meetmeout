package com.hasandel01.meetmeoutws.event;


import java.util.List;

public interface EventChatService {

    EventChatMessageDTO save(EventChatMessageDTO message, Long eventId);

    List<EventChatMessageDTO> getChatMessagesForEvent(Long eventId);
}
