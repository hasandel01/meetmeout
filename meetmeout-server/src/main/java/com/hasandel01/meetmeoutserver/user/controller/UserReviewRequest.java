package com.hasandel01.meetmeoutserver.user.controller;

public record UserReviewRequest(
        String review,
        int rating
) {
}
