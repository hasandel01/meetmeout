package com.hasandel01.meetmeoutws.notification.model;



import com.hasandel01.meetmeoutws.user.User;
import com.hasandel01.meetmeoutws.notification.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Notification {

    @Id
    @GeneratedValue
    private Long id;

    private String title;
    private String body;

    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @ManyToOne
    private User receiver;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    @ManyToOne
    private User sender;

    private String url;

}
