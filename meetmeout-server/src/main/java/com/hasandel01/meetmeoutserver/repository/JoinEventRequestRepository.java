package com.hasandel01.meetmeoutserver.repository;

import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.models.JoinEventRequest;
import com.hasandel01.meetmeoutserver.models.User;
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
