package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.models.User;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class EventMapper {

    public static EventDTO toEventDto(final Event event) {

        if(event == null) return null;

        return EventDTO.builder()
                .id(event.getId())
                .date(event.getDate())
                .time(event.getTime())
                .description(event.getDescription())
                .title(event.getTitle())
                .isDraft(event.isDraft())
                .isPrivate(event.isPrivate())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .location(event.getLocation())
                .tags(event.getTags())
                .longitude(event.getLongitude())
                .latitude(event.getLatitude())
                .status(event.getStatus())
                .maximumCapacity(event.getMaximumCapacity())
                .attendees(event.getAttendees().stream().map(UserMapper::toUserDTO).collect(Collectors.toSet()))
                .organizer(UserMapper.toUserDTO(event.getOrganizer()))
                .addressName(event.getAddressName())
                .build();
    }

    public static Set<EventDTO> toEventsDto(final List<Event> events) {
        if(events == null) return null;

        return events.stream().map(EventMapper::toEventDto).collect(Collectors.toSet());
    }
}
