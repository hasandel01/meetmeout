package com.hasandel01.meetmeoutserver.user.model;

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
public class OrganizerReviewDismissal {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne
    private User reviewer;

    @ManyToOne
    private User organizer;

    private boolean dismissed;
    private LocalDateTime dismissedAt;
}
