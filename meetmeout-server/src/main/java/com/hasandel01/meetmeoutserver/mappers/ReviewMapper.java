package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.ReviewDTO;
import com.hasandel01.meetmeoutserver.event.Review;

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
