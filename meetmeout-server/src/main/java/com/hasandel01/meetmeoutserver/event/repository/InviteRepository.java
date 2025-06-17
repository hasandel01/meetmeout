package com.hasandel01.meetmeoutserver.event.repository;

import com.hasandel01.meetmeoutserver.enums.InviteStatus;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.Invite;
import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InviteRepository  extends JpaRepository<Invite, Long> {

    Optional<List<Invite>> findByEvent(Event event);

    Optional<List<Invite>> findByInvited(User invited);

    Optional<Invite> findByInvitedAndEvent(User invited, Event event);


    @Modifying
    @Transactional
    @Query("""
      UPDATE Invite i SET i.status='EXPIRED' where i.event = :event
    """)
    void expireAllByEvent(@Param("event") Event event);

    Optional<Invite> findByInviteToken(String inviteToken);

    Optional<List<Invite>> findByEventAndStatus(Event event, InviteStatus status);

    Optional<Invite> findByInvitedAndEventAndStatus(User invited, Event event, InviteStatus status);


    @Query("""
        SELECT invite FROM Invite invite WHERE invite.invited.id= :userId OR invite.inviter.id= :userId
   
        """)
    List<Invite> findAllUserRelatedInvites(@Param("userId") Long userId);
}
