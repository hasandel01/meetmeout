package com.hasandel01.meetmeoutws.notification.dto;

import com.hasandel01.meetmeoutws.user.UserDTO;
import com.hasandel01.meetmeoutws.notification.NotificationType;
import lombok.Builder;


@Builder
public record NotificationDTO(
        Long id,
        UserDTO sender,
        UserDTO receiver,
        String title,
        String body,
        NotificationType notificationType,
        String url,
        boolean read
) {
}
