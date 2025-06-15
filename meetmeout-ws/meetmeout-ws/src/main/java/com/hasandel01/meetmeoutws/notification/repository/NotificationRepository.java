package com.hasandel01.meetmeoutws.notification.repository;

import com.hasandel01.meetmeoutws.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
