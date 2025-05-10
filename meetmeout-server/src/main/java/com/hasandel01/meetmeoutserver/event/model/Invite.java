package com.hasandel01.meetmeoutserver.event.model;

import com.hasandel01.meetmeoutserver.user.model.User;
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

    @OneToOne
    private User invited;

    @OneToOne
    private User inviter;

    @ManyToOne(cascade = CascadeType.PERSIST)
    private Event event;

    @Column(unique = true)
    private String inviteToken;

    private boolean isAccepted;

}
