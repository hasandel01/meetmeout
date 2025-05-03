package com.hasandel01.meetmeoutserver.models;


import com.hasandel01.meetmeoutserver.event.Event;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class EventChatMessage {

    @Id
    @GeneratedValue
    private long id;

    @ManyToOne
    private Event event;

    @ManyToOne
    private User sender;

    private String message;


    private LocalDateTime timestamp;

}
