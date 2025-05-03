package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.EventShortDTO;
import com.hasandel01.meetmeoutserver.models.Event;

import java.util.Set;
import java.util.stream.Collectors;

public class EventMapper {

    public static EventShortDTO toEventDto(final Event event) {

        if(event == null) return null;

        return EventShortDTO.builder()
                .date(event.getDate())
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
                .build();
    }

    public static Set<EventShortDTO> toEventsDto(final Set<Event> events) {
        if(events == null) return null;

        return events.stream().map(EventMapper::toEventDto).collect(Collectors.toSet());
    }
}
