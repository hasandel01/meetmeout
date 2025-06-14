package com.hasandel01.meetmeoutserver.event.service;

import com.hasandel01.meetmeoutserver.event.dto.ReviewDTO;
import jakarta.validation.Valid;

public interface ReviewService {

    ReviewDTO updateReview(long reviewId, ReviewDTO newReview);

    ReviewDTO addReviewToEvent(@Valid long eventId, ReviewDTO reviewDTO);

    Void deleteReviewFromEvent(long reviewId);

    Boolean getReviewDismissal(long eventId);

    Void setDissmissalToTrue(long eventId);
}
