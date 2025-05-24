package com.hasandel01.meetmeoutserver.event.service.impl;

import com.hasandel01.meetmeoutserver.event.dto.EventChatMessageDTO;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.mapper.EventChatMessageMapper;
import com.hasandel01.meetmeoutserver.event.model.EventChatMessage;
import com.hasandel01.meetmeoutserver.event.service.EventChatService;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.event.repository.EventChatMessageRepository;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventChatServiceImpl implements EventChatService {

    private final EventChatMessageRepository eventChatMessageRepository;

    private final EventRepository eventRepository;

    private final UserDetailsService userDetailsService;

    public EventChatMessageDTO save(EventChatMessageDTO message, Long eventId, Principal principal) {

        String username = principal.getName();
        User sender = (User) userDetailsService.loadUserByUsername(username);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventChatMessage chatMessage =  EventChatMessage.builder()
                .event(event)
                .sender(sender)
                .message(message.message())
                .timestamp(LocalDateTime.now())
                .build();

        eventChatMessageRepository.save(chatMessage);

        return message;
    }

    public List<EventChatMessageDTO> getChatMessagesForEvent(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found " + eventId));

        List<EventChatMessage> eventChatMessages = eventChatMessageRepository.findByEvent(event);

        return eventChatMessages.stream().map(EventChatMessageMapper::toEventChatMessageDTO).collect(Collectors.toList());

    }
}
