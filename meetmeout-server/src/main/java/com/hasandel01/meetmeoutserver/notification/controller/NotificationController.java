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
    public Page<NotificationDTO> getNotifications(Pageable pageable) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return notificationService.getNotificationsForUser(username,pageable);

    }

    @PutMapping("/change-notification-status/{notificationId}")
    public ResponseEntity<Void> updateNotificationStatusToRead(@PathVariable Long notificationId) {
        try {
            return ResponseEntity.ok(notificationService.changeStatusToRead(notificationId));
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }


}
