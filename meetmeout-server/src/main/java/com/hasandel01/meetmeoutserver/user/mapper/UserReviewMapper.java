package com.hasandel01.meetmeoutserver.user.mapper;

import com.hasandel01.meetmeoutserver.event.mapper.EventMapper;
import com.hasandel01.meetmeoutserver.user.dto.UserReviewDTO;
import com.hasandel01.meetmeoutserver.user.model.UserReview;

public class UserReviewMapper {

    public static UserReviewDTO userReviewDTO(UserReview userReview) {

        return UserReviewDTO.builder()
                .id(userReview.getId())
                .review(userReview.getReview())
                .rating(userReview.getRating())
                .event(EventMapper.toEventDto(userReview.getEvent()))
                .organizer(UserMapper.toUserDTO(userReview.getUser()))
                .reviewer(UserMapper.toUserDTO(userReview.getReviewer()))
                .createdAt(userReview.getCreatedAt())
                .build();
    }
}
