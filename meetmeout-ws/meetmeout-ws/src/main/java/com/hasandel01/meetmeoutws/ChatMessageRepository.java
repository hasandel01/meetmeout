package com.hasandel01.meetmeoutws;


import com.hasandel01.meetmeoutws.event.Event;
import com.hasandel01.meetmeoutws.event.EventChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<EventChatMessage, Long> {
    List<EventChatMessage> findByEventOrderByTimestampAsc(Event event);
}
