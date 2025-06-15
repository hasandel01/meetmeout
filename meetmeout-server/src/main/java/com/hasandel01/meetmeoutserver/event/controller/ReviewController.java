package com.hasandel01.meetmeoutserver.event.controller;

import com.hasandel01.meetmeoutserver.event.dto.ReviewDTO;
import com.hasandel01.meetmeoutserver.event.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{eventId}")
    public ResponseEntity<ReviewDTO> addReview(@Valid @PathVariable long eventId, @RequestBody ReviewDTO reviewDTO) {
        return ResponseEntity.ok(reviewService.addReviewToEvent(eventId, reviewDTO));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable long reviewId) {
        return ResponseEntity.ok(reviewService.deleteReviewFromEvent(reviewId));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable long reviewId, @RequestBody ReviewDTO newReview) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, newReview));
    }

    @GetMapping("/{eventId}/dismissal")
    public ResponseEntity<Boolean> getReviewDismissal(@PathVariable long eventId) {
        return ResponseEntity.ok(reviewService.getReviewDismissal(eventId));
    }

    @PostMapping("/{eventId}/dismissal")
    public ResponseEntity<Void> setReviewDismissal(@PathVariable long eventId) {
        return ResponseEntity.ok(reviewService.setDissmissalToTrue(eventId));
    }

    @GetMapping("/{eventId}/average-rating")
    public ResponseEntity<Double> getAverageRatingForEvent(@PathVariable long eventId) {
        return ResponseEntity.ok(reviewService.getAverageRating(eventId));
    }
}
