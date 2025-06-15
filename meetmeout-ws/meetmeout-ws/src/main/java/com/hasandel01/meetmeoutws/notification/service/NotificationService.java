package com.hasandel01.meetmeoutws.notification.service;

import com.hasandel01.meetmeoutws.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutws.notification.mapper.NotificationMapper;
import com.hasandel01.meetmeoutws.notification.model.Notification;
import com.hasandel01.meetmeoutws.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationDTO markAsReadAndReturn(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);

        return NotificationMapper.toNotificationDTO(notification);
    }

}
