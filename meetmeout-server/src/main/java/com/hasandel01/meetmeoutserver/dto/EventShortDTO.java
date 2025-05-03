package com.hasandel01.meetmeoutserver.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.hasandel01.meetmeoutserver.enums.Categories;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Builder
public record EventShortDTO(
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
        EventStatus eventStatus) {
}
