package com.hasandel01.meetmeoutserver.service;

import com.hasandel01.meetmeoutserver.dto.NotificationDTO;
import com.hasandel01.meetmeoutserver.enums.NotificationType;
import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.mappers.NotificationMapper;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.models.Notification;
import com.hasandel01.meetmeoutserver.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;


@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final FriendRequestRepository friendRequestRepository;

    public void sendEventCreatedNotificationToCompanions(User creator, Event newEvent) {


        Set<User> companions = friendRequestRepository.findAcceptedFriends(creator.getId());

        for(User companion : companions) {
            log.info("Sending notification to: {}", companion.getUsername());
            Notification notification = Notification.builder()
                    .receiver(companion)
                    .sender(creator)
                    .title("New event from your friend!")
                    .body(creator.getFirstName() + " started a new event " + newEvent.getTitle())
                    .url("/event/" + newEvent.getId())
                    .notificationType(NotificationType.STARTED_EVENT)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);

            messagingTemplate
                    .convertAndSendToUser(companion.getUsername(),
                            "queue/notifications",
                            NotificationMapper.toNotificationDTO(notification));

            log.info("Notification sent: {}", companion.getUsername());
        }
    }


    public Page<NotificationDTO> getNotificationsForUser(String username, Pageable pageable) {
        return notificationRepository.findByReceiverUsernameOrderByIdDesc(username,pageable)
                .map(NotificationMapper::toNotificationDTO);

    }
}
