package com.hasandel01.meetmeoutserver.notification;

import com.hasandel01.meetmeoutserver.enums.NotificationType;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
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
