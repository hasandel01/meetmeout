package com.hasandel01.meetmeoutserver.event.repository;

import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.Invite;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InviteRepository  extends JpaRepository<Invite, Long> {

    Optional<List<Invite>> findByEvent(Event event);

    Optional<List<Invite>> findByInvited(User invited);

    Optional<Invite> findByInvitedAndEvent(User invited, Event event);
}
