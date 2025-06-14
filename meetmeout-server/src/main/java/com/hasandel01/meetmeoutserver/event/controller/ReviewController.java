package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.ReviewDTO;
import com.hasandel01.meetmeoutserver.event.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/{eventId}")
    public ResponseEntity<ReviewDTO> addReview(@Valid @PathVariable long eventId, @RequestBody ReviewDTO reviewDTO) {
        try {
            return ResponseEntity.ok(reviewService.addReviewToEvent(eventId, reviewDTO));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable long reviewId) {
        try {
            return ResponseEntity.ok(reviewService.deleteReviewFromEvent(reviewId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable long reviewId, @RequestBody ReviewDTO newReview) {
        try {
            return ResponseEntity.ok(reviewService.updateReview(reviewId,newReview));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{eventId}/dismissal")
    public ResponseEntity<Boolean> getReviewDismissal(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(reviewService.getReviewDismissal(eventId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{eventId}/dismissal")
    public ResponseEntity<Void> setReviewDismissal(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(reviewService.setDissmissalToTrue(eventId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
