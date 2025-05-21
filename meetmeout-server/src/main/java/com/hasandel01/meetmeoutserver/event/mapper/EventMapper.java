package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class EventMapper {

    public static EventDTO toEventDto(final Event event) {

        if(event == null) return null;

        return EventDTO.builder()
                .id(event.getId())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .description(event.getDescription())
                .title(event.getTitle())
                .isDraft(event.isDraft())
                .isPrivate(event.isPrivate())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .tags(event.getTags())
                .longitude(event.getLongitude())
                .latitude(event.getLatitude())
                .isThereRoute(event.isThereRoute())
                .endLatitude(event.getEndLatitude())
                .feeDescription(event.getFeeDescription())
                .endLongitude(event.getEndLongitude())
                .endAddressName(event.getEndAddressName())
                .routeType(event.getRouteType())
                .status(event.getStatus())
                .isCapacityRequired(event.isCapacityRequired())
                .maximumCapacity(event.getMaximumCapacity())
                .attendees(event.getAttendees().stream().map(UserMapper::toUserDTO).collect(Collectors.toSet()))
                .organizer(UserMapper.toUserDTO(event.getOrganizer()))
                .addressName(event.getAddressName())
                .likes(event.getLikes().stream().map(LikeMapper::toLikeDTO).collect(Collectors.toSet()))
                .comments(event.getComments().stream().map(CommentMapper::toCommentDTO).collect(Collectors.toSet()))
                .reviews(event.getReviews().stream().map(ReviewMapper::toReviewDTO).collect(Collectors.toSet()))
                .createdAt(event.getCreatedAt())
                .isFeeRequired(event.isFeeRequired())
                .fee(event.getFee())
                .eventPhotoUrls(event.getEventPhotoUrls())
                .build();
    }

    public static Set<EventDTO> toEventsDto(final List<Event> events) {
        if(events == null) return null;

        return events.stream().map(EventMapper::toEventDto).collect(Collectors.toSet());
    }
}
