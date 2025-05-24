package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.ReviewDTO;
import com.hasandel01.meetmeoutserver.event.model.Review;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

public class ReviewMapper {

    public static ReviewDTO toReviewDTO(Review review) {
        return ReviewDTO.builder()
                .reviewId(review.getId())
                .updatedAt(review.getUpdatedAt())
                .reviewer(UserMapper.toUserDTO(review.getReviewer()))
                .content(review.getContent())
                .rating(review.getRating())
                .build();
    }

}
