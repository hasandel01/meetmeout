package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.ReviewDTO;
import com.hasandel01.meetmeoutserver.event.model.Review;

public class ReviewMapper {

    public static ReviewDTO toReviewDTO(Review review) {
        return ReviewDTO.builder()
                .title(review.getTitle())
                .updatedAt(review.getUpdatedAt())
                .reviewerId(review.getReviewer().getId())
                .content(review.getContent())
                .rating(review.getRating())
                .build();
    }

}
