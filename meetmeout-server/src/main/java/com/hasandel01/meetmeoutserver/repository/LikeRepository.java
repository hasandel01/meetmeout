package com.hasandel01.meetmeoutserver.repository;

import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.event.Like;
import com.hasandel01.meetmeoutserver.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndEvent(User user, Event event);
}
