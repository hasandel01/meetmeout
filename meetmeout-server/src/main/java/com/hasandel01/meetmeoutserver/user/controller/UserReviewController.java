package com.hasandel01.meetmeoutserver.user.controller;

import com.hasandel01.meetmeoutserver.user.dto.UserReviewDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserReviewRequest;
import com.hasandel01.meetmeoutserver.user.service.UserReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-reviews")
@RequiredArgsConstructor
public class UserReviewController {

    private final UserReviewService userReviewService;

    @PostMapping("/event/{eventId}/to/{organizerId}/by/{reviewerId}")
    public ResponseEntity<Boolean> addUserReview(@PathVariable long eventId,
                                                 @PathVariable long organizerId,
                                                 @PathVariable long reviewerId,
                                                 @RequestBody UserReviewRequest userReviewRequest) {
        return ResponseEntity.ok(userReviewService.addUserReview(eventId, organizerId, reviewerId, userReviewRequest));
    }

    @PutMapping("/{reviewId}/edit")
    public ResponseEntity<UserReviewDTO> updateUserReview(@PathVariable long reviewId,
                                                          @RequestBody UserReviewDTO updatedReview) {
        return ResponseEntity.ok(userReviewService.updateUserReview(reviewId, updatedReview));
    }

    @DeleteMapping("/{reviewId}/delete")
    public ResponseEntity<Boolean> deleteUserReview(@PathVariable long reviewId) {
        userReviewService.deleteUserReview(reviewId);
        return ResponseEntity.ok(true);
    }

    @GetMapping("/of/{userId}")
    public ResponseEntity<List<UserReviewDTO>> getReviewsForUser(@PathVariable long userId) {
        return ResponseEntity.ok(userReviewService.getReviewsForUser(userId));
    }

}
