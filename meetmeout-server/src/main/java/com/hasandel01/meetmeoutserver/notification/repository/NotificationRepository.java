package com.hasandel01.meetmeoutserver.notification.repository;

import com.hasandel01.meetmeoutserver.enums.NotificationType;
import com.hasandel01.meetmeoutserver.notification.dto.NotificationDTO;
import com.hasandel01.meetmeoutserver.notification.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {


    @Modifying
    @Query("DELETE FROM Notification nt where nt.receiver.id =:userId or nt.sender.id =: userId")
    void deleteAllReceiverNotifications(@Param("userId") Long userId);


    Page<Notification> findByReceiverUsernameOrderByCreatedAtDesc(String receiverUsername, Pageable pageable);


    Page<Notification> findByReceiverUsernameAndNotificationTypeOrderByCreatedAtDesc(String receiverUsername,
                                                                                     NotificationType notificationType,
                                                                                     Pageable pageable);
}
