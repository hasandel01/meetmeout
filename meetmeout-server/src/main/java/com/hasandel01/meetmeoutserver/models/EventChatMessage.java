package com.hasandel01.meetmeoutserver.models;


import com.hasandel01.meetmeoutserver.event.Event;
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
public class EventChatMessage {

    @Id
    @GeneratedValue
    private long id;

    @ManyToOne(optional = false)
    private Event event;

    @ManyToOne(optional = false)
    private User sender;

    @Column(nullable = false, length = 1000)
    private String message;

    private LocalDateTime timestamp;

}
