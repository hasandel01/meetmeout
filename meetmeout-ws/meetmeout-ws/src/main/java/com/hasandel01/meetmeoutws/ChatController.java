package com.hasandel01.meetmeoutws;

import com.hasandel01.meetmeoutws.event.EventChatMessageDTO;
import com.hasandel01.meetmeoutws.event.EventChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final EventChatService eventChatService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat/event/{eventId}")
    public void sendMessage(@DestinationVariable Long eventId,
                            EventChatMessageDTO message) {


        EventChatMessageDTO savedMessage = eventChatService.save(message, eventId);
        simpMessagingTemplate.convertAndSend("/topic/chat/event/" + eventId, savedMessage);
    }


}

