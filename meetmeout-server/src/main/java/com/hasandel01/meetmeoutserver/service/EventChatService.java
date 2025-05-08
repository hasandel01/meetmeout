package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.dto.EventChatMessageDTO;
import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.mappers.EventChatMessageMapper;
import com.hasandel01.meetmeoutserver.models.EventChatMessage;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.EventChatMessageRepository;
import com.hasandel01.meetmeoutserver.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventChatService {

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
