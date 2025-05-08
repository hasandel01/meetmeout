package com.hasandel01.meetmeoutserver.event.repository;

import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.JoinEventRequest;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JoinEventRequestRepository extends JpaRepository<JoinEventRequest, Long> {
    Optional<List<JoinEventRequest>> findByEvent(Event event);

    Optional<List<JoinEventRequest>> findBySender(User sender);

    List<JoinEventRequest> findByEventAndSender(Event event, User sender);
}
