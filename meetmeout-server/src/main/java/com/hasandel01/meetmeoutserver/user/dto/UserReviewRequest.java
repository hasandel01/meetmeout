package com.hasandel01.meetmeoutserver.user.dto;

public record UserReviewRequest(
        String review,
        int rating
) {
}
