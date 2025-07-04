package com.hasandel01.meetmeoutws.event;


import com.hasandel01.meetmeoutws.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
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

    @Column(nullable = false)
    @Size(min = 1, max = 1000)
    private String message;

    private LocalDateTime timestamp;

}
