package com.hasandel01.meetmeoutserver.notification.service.impl;


import com.hasandel01.meetmeoutserver.companion.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.enums.NotificationType;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.EventCar;
import com.hasandel01.meetmeoutserver.event.model.Invite;
import com.hasandel01.meetmeoutserver.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutserver.notification.exceptions.NotificationNotFoundException;
import com.hasandel01.meetmeoutserver.notification.mapper.NotificationMapper;
import com.hasandel01.meetmeoutserver.notification.model.Notification;
import com.hasandel01.meetmeoutserver.notification.repository.NotificationRepository;
import com.hasandel01.meetmeoutserver.notification.service.NotificationService;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.wsrelay.WebSocketNotificationRelayService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final FriendRequestRepository friendRequestRepository;

    private final WebSocketNotificationRelayService webSocketRelay;

    @Transactional
    public Page<NotificationDTO> getNotificationsForUser(Pageable pageable) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return notificationRepository.findByReceiverUsernameOrderByIdDesc(username,pageable)
                .map(NotificationMapper::toNotificationDTO);

    }

    @Transactional
    public boolean changeStatusToRead(Long notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->  new NotificationNotFoundException("Notification not found"));


        notification.setRead(true);
        notificationRepository.save(notification);

        return true;
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

            saveAndSend(notification);
        }
    }

    public void sendFriendRequestNotification(User sender, User receiver) {

        Notification notification = Notification.builder()
                .notificationType(NotificationType.FRIEND_REQUEST)
                .sender(sender)
                .receiver(receiver)
                .title("A new friend request.")
                .body(sender.getUsername() + " has sent you a companion request")
                .url("/" + receiver.getUsername() + "/companions?page=2")
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        saveAndSend(notification);
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

        saveAndSend(notification);
    }

    public void likeNotification(User sender, Event event) {

        if(sender.getUsername().equals(event.getOrganizer().getUsername()))
            return;

        Notification notification = Notification.builder()
                .notificationType(NotificationType.EVENT_LIKE)
                .sender(sender)
                .receiver(event.getOrganizer())
                .title("💝")
                .body(sender.getUsername() + " liked your event.")
                .url("/event/" + event.getId())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        saveAndSend(notification);
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

        saveAndSend(notification);
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

        saveAndSend(notification);
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

        saveAndSend(notification);

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

            saveAndSend(notification);
        }
    }



    public void sendKickNotificationToUser(User attendee, Event event) {

        Notification notification = Notification.builder()
                .notificationType(NotificationType.USER_KICKED)
                .title("You are kicked from an event. 🦵")
                .body(event.getOrganizer().getUsername() + " has kicked you from event " + event.getTitle())
                .url("/event/" + event.getId())
                .sender(event.getOrganizer())
                .receiver(attendee)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        saveAndSend(notification);
    }

    public void sendCarApprovalNotificationToOrganizer(EventCar eventCar, User carOwner) {

        Notification notification = Notification.builder()
                .notificationType(NotificationType.CAR_REQUEST)
                .title("Is your event available for new cars?")
                .body(eventCar.getEvent().getOrganizer().getUsername()
                        + " wants to add car(s) to event " + eventCar.getEvent().getTitle())
                .url("/event/" + eventCar.getEvent().getId())
                .sender(carOwner)
                .receiver(eventCar.getEvent().getOrganizer())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        saveAndSend(notification);
    }

    public void sendCarAddedNotificationToOwner(User owner, Event event) {

        Notification notification = Notification.builder()
                .notificationType(NotificationType.CAR_ADDED)
                .title("Your car has been added to an event!")
                .body("Your car has been added to the event: " + event.getTitle())
                .url("/event/" + event.getId())
                .sender(event.getOrganizer())
                .receiver(owner)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        saveAndSend(notification);
    }


    private void saveAndSend(Notification notification) {
        notificationRepository.save(notification);
        NotificationDTO dto = NotificationMapper.toNotificationDTO(notification);
        webSocketRelay.send(dto);
    }

}
