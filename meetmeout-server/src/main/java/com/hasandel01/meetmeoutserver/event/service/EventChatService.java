package com.hasandel01.meetmeoutserver.event.service;


import com.hasandel01.meetmeoutserver.event.dto.EventChatMessageDTO;

import java.security.Principal;
import java.util.List;

public interface EventChatService {

    EventChatMessageDTO save(EventChatMessageDTO message, Long eventId, Principal principal);

    List<EventChatMessageDTO> getChatMessagesForEvent(Long eventId);
}
