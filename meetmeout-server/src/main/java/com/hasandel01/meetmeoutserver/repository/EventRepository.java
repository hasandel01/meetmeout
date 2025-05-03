package com.hasandel01.meetmeoutserver.repository;

import com.hasandel01.meetmeoutserver.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
}
