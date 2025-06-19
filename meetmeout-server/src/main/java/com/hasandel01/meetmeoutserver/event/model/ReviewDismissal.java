package com.hasandel01.meetmeoutserver.event.model;


import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDismissal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne
    private User reviewer;

    @ManyToOne
    private Event event;

    private boolean dismissed;
    private LocalDateTime dismissedAt;
}
