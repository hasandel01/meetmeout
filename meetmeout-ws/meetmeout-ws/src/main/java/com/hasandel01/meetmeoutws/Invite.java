package com.hasandel01.meetmeoutws;

import com.hasandel01.meetmeoutws.event.Event;
import com.hasandel01.meetmeoutws.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Invite {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    private User invited;

    @ManyToOne
    private User inviter;

    @ManyToOne(cascade = CascadeType.PERSIST)
    private Event event;

    @Column(unique = true)
    private String inviteToken;

}
