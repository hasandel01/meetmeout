package com.hasandel01.meetmeoutserver.user.repository;

import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.user.model.ReviewDismissal;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewDismissalRepository extends JpaRepository<ReviewDismissal, Long> {
    List<ReviewDismissal> findByReviewerAndEvent(User reviewer, Event event);
}
