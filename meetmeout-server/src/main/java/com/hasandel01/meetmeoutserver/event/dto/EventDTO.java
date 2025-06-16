package com.hasandel01.meetmeoutserver.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hasandel01.meetmeoutserver.event.model.RouteType;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.enums.Categories;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import lombok.Builder;
import org.springframework.cglib.core.Local;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

@Builder
public record EventDTO(
        Long id,
        String title,
        String description,
        Categories category,
        LocalDate startDate,
        LocalDate endDate,
        @JsonFormat(pattern = "HH:mm") LocalTime startTime,
        @JsonFormat(pattern = "HH:mm") LocalTime endTime,
        String imageUrl,
        Set<String> tags,
        double latitude,
        double longitude,
        boolean isPrivate,
        boolean isDraft,
        boolean isCapacityRequired,
        int maximumCapacity,
        EventStatus status,
        Set<UserDTO> attendees,
        UserDTO organizer,
        String addressName,
        MultipartFile eventImage,
        Set<LikeDTO> likes,
        Set<CommentDTO> comments,
        Set<ReviewDTO> reviews,
        boolean isThereRoute,
        double endLatitude,
        double endLongitude,
        boolean isFeeRequired,
        double fee,
        LocalDateTime createdAt,
        Set<EventPhotoDTO> eventPhotos,
        String feeDescription,
        String endAddressName,
        RouteType routeType,
        String routeJson) {
}
