package com.hasandel01.meetmeoutserver.event.model;


import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JoinEventRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne
    private User sender;

    @ManyToOne
    private Event event;

    @CreatedDate
    private LocalDateTime createdAt;
}
