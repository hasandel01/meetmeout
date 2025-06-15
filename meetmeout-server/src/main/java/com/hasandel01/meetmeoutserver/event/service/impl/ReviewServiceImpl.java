package com.hasandel01.meetmeoutserver.event.service.impl;


import com.hasandel01.meetmeoutserver.event.dto.ReviewDTO;
import com.hasandel01.meetmeoutserver.event.mapper.ReviewMapper;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.Review;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.event.repository.ReviewRepository;
import com.hasandel01.meetmeoutserver.event.service.ReviewService;
import com.hasandel01.meetmeoutserver.exceptions.EventNotFoundException;
import com.hasandel01.meetmeoutserver.user.model.ReviewDismissal;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.ReviewDismissalRepository;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final ReviewDismissalRepository reviewDismissalRepository;

    @Transactional
    public ReviewDTO updateReview(long reviewId, ReviewDTO newReview) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));


        review.setContent(newReview.content());
        review.setRating(newReview.rating());

        reviewRepository.save(review);

        return ReviewMapper.toReviewDTO(review);
    }

    @Transactional
    public ReviewDTO addReviewToEvent(@Valid long eventId, ReviewDTO reviewDTO) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Review review = Review.builder()
                .reviewer(user)
                .event(event)
                .content(reviewDTO.content())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .rating(reviewDTO.rating())
                .build();

        return ReviewMapper.toReviewDTO(reviewRepository.save(review));

    }

    @Transactional
    public Void deleteReviewFromEvent(long reviewId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));


        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if(user.getUsername().equals(review.getReviewer().getUsername()))
            reviewRepository.delete(review);
        else
            throw new RuntimeException("You are not the reviewer of this review");

        return null;
    }

    @Transactional
    public Boolean getReviewDismissal(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        List<ReviewDismissal> dismissals = reviewDismissalRepository.findByReviewerAndEvent(user,event);

        return !dismissals.isEmpty();
    }


    @Override
    public Void setDissmissalToTrue(long eventId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        List<ReviewDismissal> dismissals = reviewDismissalRepository.findByReviewerAndEvent(user,event);

        if(dismissals.isEmpty()) {
            ReviewDismissal dismissal = ReviewDismissal
                    .builder()
                    .dismissed(true)
                    .event(event)
                    .reviewer(user)
                    .build();

            reviewDismissalRepository.save(dismissal);
        } else {
            return null;
        }

        return null;
    }

    @Transactional
    public Double getAverageRating(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        List<Review> reviewList = reviewRepository.findByEvent(event);

        return !reviewList.isEmpty() ?
                reviewList.stream().mapToDouble(Review::getRating).sum()/ reviewList.size() : 0;
    }

}
