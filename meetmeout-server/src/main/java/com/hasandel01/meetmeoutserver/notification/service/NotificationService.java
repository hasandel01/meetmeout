package com.hasandel01.meetmeoutserver.notification.service;


import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.EventCar;
import com.hasandel01.meetmeoutserver.event.model.Invite;
import com.hasandel01.meetmeoutserver.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationDTO> getNotificationsForUser(Pageable pageable);
    boolean changeStatusToRead(Long notificationId);

    void sendEventCreatedNotificationToCompanions(User creator, Event newEvent);
    void sendFriendRequestNotification(User sender, User receiver);
    void sendRequestAcceptedNotification(User sender, User receiver);
    void likeNotification(User sender, Event event);
    void sendJoinRequestToOrganizer(Event event, User sender);
    void sendJoinRequestAcceptedNotification(Event event, User receiver);
    void sendUserInvitationNotification(Invite invite);
    void sendEventUpdatedNotificationToAttendees(Event event);
    void sendKickNotificationToUser(User attendee, Event event);
    void sendCarApprovalNotificationToOrganizer(EventCar eventCar, User carOwner);
    void sendCarAddedNotificationToOwner(User owner, Event event);
}
