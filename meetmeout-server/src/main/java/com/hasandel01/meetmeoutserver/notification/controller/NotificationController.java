package com.hasandel01.meetmeoutserver.notification.controller;


import com.hasandel01.meetmeoutserver.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutserver.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(pageable));
    }

    @PutMapping("/status/{notificationId}")
    public ResponseEntity<Boolean> updateNotificationStatusToRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.changeStatusToRead(notificationId));
    }

}
