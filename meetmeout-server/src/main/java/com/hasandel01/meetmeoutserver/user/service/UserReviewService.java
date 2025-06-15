package com.hasandel01.meetmeoutserver.user.service;

import com.hasandel01.meetmeoutserver.user.dto.UserReviewRequest;
import com.hasandel01.meetmeoutserver.user.dto.UserReviewDTO;

import java.util.List;

public interface UserReviewService {

    Boolean addUserReview(long eventId, long organizerId, long reviewerId, UserReviewRequest userReviewRequest);

    UserReviewDTO updateUserReview(long reviewId, UserReviewDTO updatedReview);

    void deleteUserReview(long reviewId);

    List<UserReviewDTO> getReviewsForUser(long userId);
}
