package com.hasandel01.meetmeoutws.notification.service;


import com.hasandel01.meetmeoutws.event.Event;
import com.hasandel01.meetmeoutws.FriendRequestRepository;
import com.hasandel01.meetmeoutws.Invite;
import com.hasandel01.meetmeoutws.user.User;
import com.hasandel01.meetmeoutws.notification.NotificationType;
import com.hasandel01.meetmeoutws.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutws.notification.mapper.NotificationMapper;
import com.hasandel01.meetmeoutws.notification.model.Notification;
import com.hasandel01.meetmeoutws.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final FriendRequestRepository friendRequestRepository;

    public NotificationDTO markAsReadAndReturn(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);

        return NotificationMapper.toNotificationDTO(notification);
    }

    public void sendEventCreatedNotificationToCompanions(User creator, Event newEvent) {

        Set<User> companions = friendRequestRepository.findAcceptedFriends(creator.getId());

        for(User companion : companions) {
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

        }
    }

    @Transactional
    public Page<NotificationDTO> getNotificationsForUser(String username, Pageable pageable) {
        return notificationRepository.findByReceiverUsernameOrderByIdDesc(username,pageable)
                .map(NotificationMapper::toNotificationDTO);

    }

    public void sendFriendRequestNotification(User sender, User receiver) {

        Notification notification = Notification.builder()
                .notificationType(NotificationType.FRIEND_REQUEST)
                .sender(sender)
                .receiver(receiver)
                .title("A new friend request.")
                .body(sender.getUsername() + " has sent you a companion request")
                .url("/" + receiver.getUsername() + "/companions")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public void sendRequestAcceptedNotification(User sender, User receiver) {

        Notification notification = Notification.builder()
                .notificationType(NotificationType.FRIEND_RESPONSE)
                .sender(sender)
                .receiver(receiver)
                .title("Friend request accepted.")
                .body(sender.getUsername() + " accepted your friend request.")
                .url("/" + receiver.getUsername() + "/companions")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public void likeNotification(User sender, Event event) {

        if(sender.getUsername().equals(event.getOrganizer().getUsername()))
            return;

        Notification notification = Notification.builder()
                .notificationType(NotificationType.FRIEND_REQUEST)
                .sender(sender)
                .receiver(event.getOrganizer())
                .title("<3")
                .body(sender.getUsername() + " liked your event.")
                .url("/event/" + event.getId())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public Void changeStatusToRead(Long notificationId) {


        Notification notification = notificationRepository.findById(notificationId)
                        .orElseThrow(() ->  new RuntimeException("Notification not found"));


        notification.setRead(true);
        notificationRepository.save(notification);

        return null;
    }

    public void sendJoinRequestToOrganizer(Event event, User sender) {

        Notification notification = Notification
                .builder()
                .notificationType(NotificationType.EVENT_REQUEST)
                .title("Somebody wants to join your private event!")
                .body(sender.getFirstName() + " wants to join your private event.")
                .url("/event/" + event.getId())
                .sender(sender)
                .receiver(event.getOrganizer())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public void sendJoinRequestAcceptedNotification(Event event, User receiver) {

        Notification notification = Notification
                .builder()
                .notificationType(NotificationType.EVENT_RESPONSE)
                .title("You joined the event!: " + event.getTitle())
                .body(event.getOrganizer().getFirstName() + " accepted your join request!")
                .url("/event/" + event.getId())
                .sender(event.getOrganizer())
                .receiver(receiver)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public void sendUserInvitationNotification(Invite invite) {

        Notification notification = Notification
                .builder()
                .notificationType(NotificationType.EVENT_INVITE)
                .title("You have an invitation to event " + invite.getEvent().getTitle())
                .body(invite.getInviter().getUsername() + " invited you to join the event!")
                .url("/event/" + invite.getEvent().getId() + "?token=" + invite.getInviteToken())
                .sender(invite.getInviter())
                .receiver(invite.getInvited())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public void sendEventUpdatedNotificationToAttendees(Event event) {

        Set<User> attendees = event.getAttendees();
        User organizer = event.getOrganizer();

        for (User attendee : attendees) {
            if (attendee.equals(organizer)) continue;

            Notification notification = Notification.builder()
                    .notificationType(NotificationType.EVENT_UPDATE)
                    .title("An event you joined has been updated.")
                    .body("The event was updated by " + organizer.getUsername())
                    .url("/event/" + event.getId())
                    .sender(organizer)
                    .receiver(attendee)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            notificationRepository.save(notification);
        }
    }

}
