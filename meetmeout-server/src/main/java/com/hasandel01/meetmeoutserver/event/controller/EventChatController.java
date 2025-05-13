package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.EventChatMessageDTO;
import com.hasandel01.meetmeoutserver.event.service.EventChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.security.Principal;
import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class EventChatController {

    private final EventChatService eventChatService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat/event/{eventId}")
    public void sendMessage(@DestinationVariable Long eventId, EventChatMessageDTO message, Principal principal) {
        EventChatMessageDTO savedMessage = eventChatService.save(message,eventId, principal);
        simpMessagingTemplate.convertAndSend("/topic/chat/event/" + eventId, savedMessage);
    }

    @GetMapping("/get-chat-messages/{eventId}")
    public ResponseEntity<List<EventChatMessageDTO>> getChatMessages(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventChatService.getChatMessagesForEvent(eventId));
    }
}
