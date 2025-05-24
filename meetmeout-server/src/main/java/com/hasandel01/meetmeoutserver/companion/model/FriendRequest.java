package com.hasandel01.meetmeoutserver.companion.model;

import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
@Data
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne
    private User sender;

    @ManyToOne
    private User receiver;

    @Enumerated(EnumType.STRING)
    private Status status;

    @CreatedDate
    private LocalDateTime sentAt;


    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }

}
