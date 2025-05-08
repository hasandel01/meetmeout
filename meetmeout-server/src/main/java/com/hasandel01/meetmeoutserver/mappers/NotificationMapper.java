package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.models.Notification;
import com.hasandel01.meetmeoutserver.dto.NotificationDTO;
import org.aspectj.weaver.ast.Not;

public class NotificationMapper {

    public static Notification toNotification(NotificationDTO notificationDTO) {
            return Notification.builder()
                    .receiver(UserMapper.toUser(notificationDTO.receiver()))
                    .sender(UserMapper.toUser(notificationDTO.sender()))
                    .title(notificationDTO.title())
                    .body(notificationDTO.body())
                    .url(notificationDTO.url())
                    .notificationType(notificationDTO.notificationType())
                    .read(notificationDTO.read())
                    .build();

    }

    public static NotificationDTO toNotificationDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .notificationType(notification.getNotificationType())
                .url(notification.getUrl())
                .receiver(UserMapper.toUserDTO(notification.getReceiver()))
                .sender(UserMapper.toUserDTO(notification.getSender()))
                .title(notification.getTitle())
                .body(notification.getBody())
                .read(notification.isRead())
                .build();
    }
}
