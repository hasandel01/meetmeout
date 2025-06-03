package com.hasandel01.meetmeoutws.notification.repository;

import com.hasandel01.meetmeoutws.notification.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverUsername(String receiverUsername);

    Page<Notification> findByReceiverUsernameOrderByIdDesc(String username, Pageable pageable);
}
