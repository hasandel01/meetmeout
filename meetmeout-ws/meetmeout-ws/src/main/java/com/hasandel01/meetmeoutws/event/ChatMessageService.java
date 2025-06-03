package com.hasandel01.meetmeoutws.event;


import com.hasandel01.meetmeoutws.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public EventChatMessage save(EventChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return chatMessageRepository.save(message);
    }

    public List<EventChatMessage> getMessagesForEvent(Event event) {
        return chatMessageRepository.findByEventOrderByTimestampAsc(event);
    }
}
