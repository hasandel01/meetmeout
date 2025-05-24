package com.hasandel01.meetmeoutserver.notification.repository;

import com.hasandel01.meetmeoutserver.notification.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.domain.Page;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverUsername(String receiverUsername);

    Page<Notification> findByReceiverUsernameOrderByIdDesc(String username, Pageable pageable);
}
