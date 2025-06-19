package com.hasandel01.meetmeoutserver.user.service.impl;


import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.exceptions.EventNotFoundException;
import com.hasandel01.meetmeoutserver.user.dto.UserReviewRequest;
import com.hasandel01.meetmeoutserver.user.dto.UserReviewDTO;
import com.hasandel01.meetmeoutserver.user.mapper.UserReviewMapper;
import com.hasandel01.meetmeoutserver.user.model.OrganizerReviewDismissal;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.model.UserReview;
import com.hasandel01.meetmeoutserver.user.repository.OrganizerReviewDismissalRepository;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.user.repository.UserReviewRepository;
import com.hasandel01.meetmeoutserver.user.service.UserReviewService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserReviewServiceImpl implements UserReviewService {

    private final EventRepository eventRepository;
    private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository;
    private final OrganizerReviewDismissalRepository organizerReviewDismissalRepository;

    @Transactional
    public Boolean addUserReview(long eventId, long organizerId, long reviewerId, UserReviewRequest userReviewRequest) {

        Event event = eventRepository.getReferenceById(eventId);

        User reviewedUser = userRepository.findById(organizerId)
                .orElseThrow(() -> new UsernameNotFoundException(organizerId + ""));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new UsernameNotFoundException(reviewerId + ""));

        UserReview userReview = UserReview.builder()
                .review(userReviewRequest.review())
                .reviewer(reviewer)
                .user(reviewedUser)
                .event(event)
                .rating(userReviewRequest.rating())
                .build();

        userReviewRepository.save(userReview);

        return true;
    }

    @Override
    public UserReviewDTO updateUserReview(long reviewId, UserReviewDTO updatedReview) {
        return null;
    }

    @Override
    public void deleteUserReview(long reviewId) {}

    @Transactional
    public List<UserReviewDTO> getReviewsForUser(long userId) {

        User user = userRepository.findById(userId).orElseThrow(() -> new UsernameNotFoundException(userId + ""));
        List<UserReview> userReviews = userReviewRepository.findByUser(user);
        return userReviews.stream().map(UserReviewMapper::userReviewDTO).collect(Collectors.toList());
    }

    @Override
    public Boolean getReviewDismissal(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));


        Optional<OrganizerReviewDismissal> organizerReviewDismissal = organizerReviewDismissalRepository
                .findByReviewerAndOrganizer(user, event.getOrganizer());

        return organizerReviewDismissal.isPresent();
    }

    @Override
    public Void setDissmissalToTrue(long eventId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));
        Optional<OrganizerReviewDismissal> existingOrganizerReviewDismissal = organizerReviewDismissalRepository
                .findByReviewerAndOrganizer(user, event.getOrganizer());

        if(existingOrganizerReviewDismissal.isPresent()) {
            throw new RuntimeException("There is an exception.");

        } else {
            OrganizerReviewDismissal organizerReviewDismissal = OrganizerReviewDismissal.builder()
                    .organizer(event.getOrganizer())
                    .dismissed(true)
                    .reviewer(user)
                    .dismissedAt(LocalDateTime.now())
                    .build();

            organizerReviewDismissalRepository.save(organizerReviewDismissal);
        }
        return null;
    }

}
