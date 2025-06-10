package com.hasandel01.meetmeoutws.event;

import com.hasandel01.meetmeoutws.user.User;
import com.hasandel01.meetmeoutws.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventChatServiceImpl implements EventChatService {

    private final EventChatMessageRepository eventChatMessageRepository;

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventChatMessageDTO save(EventChatMessageDTO message, Long eventId) {

        String username = message.user().username();
        Optional<User> sender = userRepository.findByUsername(username);

        if(sender.isEmpty()){
            throw new RuntimeException("User not found");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventChatMessage chatMessage =  EventChatMessage.builder()
                .event(event)
                .sender(sender.get())
                .message(message.message())
                .timestamp(LocalDateTime.now(ZoneId.of("Europe/Istanbul")))
                .build();

        eventChatMessageRepository.save(chatMessage);

        return EventChatMessageMapper.toEventChatMessageDTO(chatMessage);
    }

    public List<EventChatMessageDTO> getChatMessagesForEvent(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found " + eventId));

        List<EventChatMessage> eventChatMessages = eventChatMessageRepository.findByEvent(event);

        return eventChatMessages.stream().map(EventChatMessageMapper::toEventChatMessageDTO).collect(Collectors.toList());

    }
}
