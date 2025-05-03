package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.BadgeDTO;
import com.hasandel01.meetmeoutserver.models.Badge;

public class BadgeMapper {

    public static BadgeDTO toBadgeDTO(Badge badge) {

        return BadgeDTO.builder()
                .title(badge.getTitle())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .createdAt(badge.getCreatedAt())
                .build();

    }
}
