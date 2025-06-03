package com.hasandel01.meetmeoutws.notification.controller;


import com.hasandel01.meetmeoutws.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutws.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Slf4j
@RequiredArgsConstructor
@Controller
public class NotificationController {

    private final NotificationService notificationService;

    @MessageMapping("/notifications/mark-as-read")
    @SendToUser("/queue/notifications/response")
    public NotificationDTO markNotificationAsRead(@Payload Long notificationId) {
        return notificationService.markAsReadAndReturn(notificationId);
    }

}
