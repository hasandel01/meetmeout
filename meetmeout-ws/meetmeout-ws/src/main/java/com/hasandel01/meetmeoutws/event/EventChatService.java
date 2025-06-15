package com.hasandel01.meetmeoutws.event;

public interface EventChatService {
    EventChatMessageDTO save(EventChatMessageDTO message, Long eventId);
}
