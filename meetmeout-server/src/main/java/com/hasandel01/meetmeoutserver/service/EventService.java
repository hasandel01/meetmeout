package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.dto.EventShortDTO;
import com.hasandel01.meetmeoutserver.mappers.EventMapper;
import com.hasandel01.meetmeoutserver.models.Event;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.EventRepository;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CloudStorageService cloudStorageService;

    @Transactional
    public Event createEvent(EventShortDTO event) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        Event newEvent = Event.builder()
                .title(event.title())
                .description(event.description())
                .category(event.category())
                .tags(event.tags())
                .imageUrl(event.imageUrl())
                .date(event.date())
                .time(event.time())
                .location(event.location())
                .longitude(event.longitude())
                .latitude(event.latitude())
                .organizer(user)
                .attendees(new HashSet<>())
                .maximumCapacity(event.maximumCapacity())
                .isPrivate(event.isPrivate())
                .isDraft(event.isDraft())
                .status(event.eventStatus())
                .comments(new HashSet<>())
                .likes(new HashSet<>())
                .reviews(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user.getOrganizedEvents().add(newEvent);
        eventRepository.save(newEvent);
        return newEvent;
    }

    public Set<EventShortDTO> getOngoingEvents() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Getting ongoing events for {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        log.info("Getting ongoing events for " + user.getUsername());

        Set<Event> allEvents = user.getOrganizedEvents();
        allEvents.addAll(user.getParticipatedEvents());

        log.info(allEvents.toString());

        return EventMapper.toEventsDto(allEvents);
    }

    public Void updateEventPicture(long eventId, MultipartFile file) throws RuntimeException , IOException {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String imageUrl = cloudStorageService.uploadProfilePicture(file);

        event.setImageUrl(imageUrl);

        eventRepository.save(event);

        return null;
    }
}
