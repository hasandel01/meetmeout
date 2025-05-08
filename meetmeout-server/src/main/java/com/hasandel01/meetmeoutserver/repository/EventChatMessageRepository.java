package com.hasandel01.meetmeoutserver.repository;

import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.models.EventChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventChatMessageRepository extends JpaRepository<EventChatMessage, Long> {
    List<EventChatMessage> findByEvent(Event event);
}
