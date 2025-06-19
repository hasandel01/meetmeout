package com.hasandel01.meetmeoutserver.user.repository;

import com.hasandel01.meetmeoutserver.user.model.OrganizerReviewDismissal;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizerReviewDismissalRepository extends JpaRepository<OrganizerReviewDismissal, Long> {
    Optional<OrganizerReviewDismissal> findByReviewerAndOrganizer(User reviewer, User organizer);
}
