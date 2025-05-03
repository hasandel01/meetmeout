package com.hasandel01.meetmeoutserver.dto;

import com.hasandel01.meetmeoutserver.enums.Categories;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record EventDTO(
        Long id,
        String title,
        String description,
        Categories category,
        LocalDate date,
        LocalTime time,
        String location,
        String imageUrl,
        Set<String> tags,
        double latitude,
        double longitude,
        boolean isPrivate,
        boolean isDraft) {
}
