package com.hasandel01.meetmeoutserver.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.enums.Categories;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import lombok.Builder;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Builder
public record EventDTO(
        Long id,
        String title,
        String description,
        Categories category,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        String location,
        String imageUrl,
        Set<String> tags,
        double latitude,
        double longitude,
        boolean isPrivate,
        boolean isDraft,
        int maximumCapacity,
        EventStatus status,
        Set<UserDTO> attendees,
        UserDTO organizer,
        String addressName,
        MultipartFile eventImage,
        Set<LikeDTO> likes,
        Set<CommentDTO> comments,
        Set<ReviewDTO> reviews) {
}
