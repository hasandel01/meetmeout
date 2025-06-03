package com.hasandel01.meetmeoutws.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventChatMessageRepository extends JpaRepository<EventChatMessage, Long> {
    List<EventChatMessage> findByEvent(Event event);
}
