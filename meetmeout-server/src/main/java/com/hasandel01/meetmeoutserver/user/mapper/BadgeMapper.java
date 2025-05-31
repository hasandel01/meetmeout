package com.hasandel01.meetmeoutserver.user.mapper;

import com.hasandel01.meetmeoutserver.user.dto.BadgeDTO;
import com.hasandel01.meetmeoutserver.user.model.Badge;

public class BadgeMapper {

    public static BadgeDTO toBadgeDTO(Badge badge) {

        return BadgeDTO.builder()
                .id(badge.getId())
                .title(badge.getTitle())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .createdAt(badge.getCreatedAt())
                .build();

    }
}
