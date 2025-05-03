package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.mappers.EventMapper;
import com.hasandel01.meetmeoutserver.event.Event;
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
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CloudStorageService cloudStorageService;
    private final NotificationService notificationService;

    @Transactional
    public Event createEvent(EventDTO event) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        String imageUrl = cloudStorageService.uploadEventPicture(event.eventImage());

        Set<User> attendees = new HashSet<>();
        attendees.add(user);

        Event newEvent = Event.builder()
                .title(event.title())
                .description(event.description())
                .category(event.category())
                .tags(event.tags())
                .imageUrl(imageUrl)
                .date(event.date())
                .time(event.time())
                .location(event.location())
                .longitude(event.longitude())
                .latitude(event.latitude())
                .organizer(user)
                .attendees(attendees)
                .maximumCapacity(event.maximumCapacity())
                .isPrivate(event.isPrivate())
                .isDraft(event.isDraft())
                .status((event.maximumCapacity() == attendees.size()) ? EventStatus.FULL : EventStatus.ONGOING)
                .comments(new HashSet<>())
                .likes(new HashSet<>())
                .reviews(new HashSet<>())
                .addressName(event.addressName())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user.getOrganizedEvents().add(newEvent);
        eventRepository.save(newEvent);

        notificationService.sendEventCreatedNotificationToCompanions(user,newEvent);

        return newEvent;
    }

    public Set<EventDTO> getEvents(EventStatus status) {
        if (status == null) {
            return EventMapper.toEventsDto(eventRepository.findAll());
        } else {
            return EventMapper.toEventsDto( eventRepository.findByStatus(status));
        }
    }

    public Void updateEventPicture(long eventId, MultipartFile file) throws RuntimeException , IOException {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String imageUrl = cloudStorageService.uploadProfilePicture(file);

        event.setImageUrl(imageUrl);

        eventRepository.save(event);

        return null;
    }

    public EventDTO getEventById(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        return EventMapper.toEventDto(event);
    }

    @Transactional
    public Void join(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        user.getParticipatedEvents().add(event);
        event.getAttendees().add(user);
        eventRepository.save(event);
        userRepository.save(user);

        return null;
    }

    public Void leaveEvent(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User Not Found"));

        event.getAttendees().remove(user);

        eventRepository.save(event);
        userRepository.save(user);

        if(user.equals(event.getOrganizer())) {
            user.getOrganizedEvents().remove(event);
            eventRepository.delete(event);
        }
        return null;
    }
}
