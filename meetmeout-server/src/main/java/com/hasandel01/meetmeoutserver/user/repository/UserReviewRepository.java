package com.hasandel01.meetmeoutserver.user.repository;

import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.model.UserReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReviewRepository extends JpaRepository<UserReview, Long> {
    List<UserReview> findByUser(User user);
}
