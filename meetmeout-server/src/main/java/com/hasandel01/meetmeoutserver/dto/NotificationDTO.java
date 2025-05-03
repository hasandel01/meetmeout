package com.hasandel01.meetmeoutserver.dto;

import com.hasandel01.meetmeoutserver.enums.NotificationType;
import lombok.Builder;


@Builder
public record NotificationDTO(
        UserDTO sender,
        UserDTO receiver,
        String title,
        String body,
        NotificationType notificationType,
        String url,
        boolean read
) {
}
