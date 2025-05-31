package com.hasandel01.meetmeoutserver.user.mapper;

import com.hasandel01.meetmeoutserver.user.dto.BadgeDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserReviewDTO;
import com.hasandel01.meetmeoutserver.user.model.Badge;
import com.hasandel01.meetmeoutserver.user.model.UserReview;

public class UserReviewMapper {

    public static UserReviewDTO userReviewDTO(UserReview userReview) {

        return UserReviewDTO.builder()
                .id(userReview.getId())
                .review(userReview.getReview())
                .rating(userReview.getRating())
                .reviewer(UserMapper.toUserDTO(userReview.getReviewer()))
                .createdAt(userReview.getCreatedAt())
                .build();

    }
}
