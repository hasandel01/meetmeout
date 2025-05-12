package com.hasandel01.meetmeoutserver.event.service;


import com.hasandel01.meetmeoutserver.event.dto.*;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.event.mapper.InviteMapper;
import com.hasandel01.meetmeoutserver.event.model.*;
import com.hasandel01.meetmeoutserver.event.repository.*;
import com.hasandel01.meetmeoutserver.event.mapper.EventMapper;
import com.hasandel01.meetmeoutserver.event.mapper.JoinRequestMapper;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.common.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.notification.NotificationService;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CloudStorageService cloudStorageService;
    private final NotificationService notificationService;
    private final LikeRepository likeRepository;
    private final ReviewRepository reviewRepository;
    private final CommentRepository commentRepository;
    private final JoinEventRequestRepository joinEventRequestRepository;
    private final InviteRepository inviteRepository;

    @Transactional
    public Long createEvent(EventDTO event) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        String imageUrl = cloudStorageService.uploadEventPicture(event.eventImage());

        Set<User> attendees = new HashSet<>();
        attendees.add(user);

        Event newEvent = Event.builder()
                .title(event.title())
                .description(event.description())
                .category(event.category())
                .tags(event.tags())
                .imageUrl(imageUrl)
                .date(event.date())
                .time(event.time())
                .location(event.location())
                .longitude(event.longitude())
                .latitude(event.latitude())
                .organizer(user)
                .attendees(attendees)
                .maximumCapacity(event.maximumCapacity())
                .isPrivate(event.isPrivate())
                .isDraft(event.isDraft())
                .status((event.maximumCapacity() == attendees.size()) ? EventStatus.FULL : EventStatus.ONGOING)
                .comments(new HashSet<>())
                .likes(new HashSet<>())
                .reviews(new HashSet<>())
                .addressName(event.addressName())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user.getOrganizedEvents().add(newEvent);
        newEvent = eventRepository.save(newEvent);

        notificationService.sendEventCreatedNotificationToCompanions(user,newEvent);

        return newEvent.getId();
    }

    public Set<EventDTO> getEvents(EventStatus status) {
        if (status == null) {
            return EventMapper.toEventsDto(eventRepository.findAll());
        } else {
            return EventMapper.toEventsDto( eventRepository.findByStatus(status));
        }
    }

    public Void updateEventPicture(long eventId, MultipartFile file) throws RuntimeException , IOException {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String imageUrl = cloudStorageService.uploadProfilePicture(file);

        event.setImageUrl(imageUrl);

        eventRepository.save(event);

        return null;
    }

    public EventDTO getEventById(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        return EventMapper.toEventDto(event);
    }

    @Transactional
    public Void join(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Invite invite = inviteRepository.findByInvitedAndEvent(user,event)
                .orElse(null);

        if(event.isPrivate() && invite == null) {
            return sendJoinEventRequest(event);
        } else {

            user.getParticipatedEvents().add(event);
            event.getAttendees().add(user);
            eventRepository.save(event);
            userRepository.save(user);
        }

        return null;
    }

    private Void sendJoinEventRequest(Event event) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));


        JoinEventRequest joinEventRequest = JoinEventRequest.builder()
                .event(event)
                .createdAt(LocalDateTime.now())
                .sender(user)
                .build();

        joinEventRequestRepository.save(joinEventRequest);

        notificationService.sendJoinRequestToOrganizer(event,user);

        return null;
    }

    @Transactional
    public Void acceptJoinRequest(long eventId, String username) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        user.getParticipatedEvents().add(event);
        event.getAttendees().add(user);
        eventRepository.save(event);
        userRepository.save(user);

        notificationService.sendJoinRequestAcceptedNotification(event,user);

        List<JoinEventRequest> joinEventRequest = joinEventRequestRepository.findByEventAndSender(event,user);

        joinEventRequestRepository.deleteAll(joinEventRequest);

        return null;
    }



    public Void leaveEvent(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("User Not Found"));

        event.getAttendees().remove(user);

        eventRepository.save(event);
        userRepository.save(user);

        if(user.equals(event.getOrganizer())) {
            user.getOrganizedEvents().remove(event);
            eventRepository.delete(event);
        }
        return null;
    }

    @Transactional
    public Void likeEvent(long eventId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Optional<Like> like = likeRepository.findByUserAndEvent(user,event);

        if(like.isPresent()) {
            likeRepository.delete(like.get());
        }else {
            Like newLike = Like.builder().user(user).event(event).build();
            likeRepository.save(newLike);
            notificationService.likeNotification(user, event);
        }

        return null;
    }

    public Void addReviewToEvent(@Valid long eventId, ReviewDTO reviewDTO) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));


        Review review = Review.builder()
                .reviewer(user)
                .event(event)
                .content(reviewDTO.content())
                .title(reviewDTO.title())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .rating(reviewDTO.rating())
                .build();


        reviewRepository.save(review);

        return null;
    }

    public Void deleteReviewFromEvent(long eventId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));


        Optional<Review> review = reviewRepository.findByReviewerAndEvent(user,event);


        review.ifPresent(reviewRepository::delete);

        return null;
    }


    public Void addComment(@Valid long eventId, CommentDTO commentDTO) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));


        Comment comment = Comment.builder()
                .event(event)
                .sender(user)
                .comment(commentDTO.comment())
                .sentAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        commentRepository.save(comment);

        return null;
    }

    public Void deleteComment(long commentId) {

        Optional<Comment> comment = commentRepository.findById(commentId);

        comment.ifPresent(commentRepository::delete);

        return null;
    }


    public List<JoinRequestDTO> getAllJoinRequests(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Optional<List<JoinEventRequest>> joinEventRequests = joinEventRequestRepository.findByEvent(event);

        return joinEventRequests
                .orElse(Collections.emptyList())
                .stream()
                .map(JoinRequestMapper::toJoinRequestDTO)
                .toList();

    }

    public List<EventDTO> getAllRequestSentEvents() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));


        List<JoinEventRequest> joinEventRequest = joinEventRequestRepository.findBySender(user)
                .orElse(Collections.emptyList());

        List<EventDTO> eventDTOS = new ArrayList<>();

        joinEventRequest.forEach(joinEventRequest1 -> {
            eventDTOS.add(EventMapper.toEventDto(joinEventRequest1.getEvent()));
        });

        return eventDTOS;

    }

    public Void sendInvitationToUsers(List<UserDTO> users, long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<Long> userIds = users.stream().map(UserDTO::id).toList();


        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

            for(User user: userRepository.findAllById(userIds)) {

                    String token = UUID.randomUUID().toString();

                    Invite invite = Invite.builder()
                            .invited(user)
                            .inviter(sender)
                            .inviteToken(token)
                            .event(event)
                            .isAccepted(false)
                            .build();

                    inviteRepository.save(invite);

                    notificationService.sendUserInvitationNotification(invite);
            }

        return null;
    }

    public Void verifyAccessTokenForEvent(long eventId, Map<String, String> payload) {

      Event event = eventRepository.findById(eventId)
              .orElseThrow(() -> new RuntimeException("Event not found"));


      if(!event.isPrivate())
        return null;

      String username = SecurityContextHolder.getContext().getAuthentication().getName();

      User user = userRepository.findByUsername(username)
              .orElseThrow(() -> new RuntimeException("User Not Found"));

      if(event.getAttendees().contains(user)) {
          return null;
      } else {

          List<Invite> invites = inviteRepository.findByEvent(event)
                  .orElseThrow(() -> new RuntimeException(
                          "User is not invited to this event, yet tries to access it"));

          String token = payload.get("token");

          Optional<Invite> invite = invites.stream()
                  .filter(invite1 -> invite1.getInviteToken().equals(token))
                  .findFirst();

          if(invite.isPresent()) {
              return null;
          }
          else {
              throw new RuntimeException("Invalid access token");
          }
      }
    }

    public List<InviteDTO> getInvitations() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        List<Invite> invites = inviteRepository.findByInvited(user)
                .orElse(Collections.emptyList());

        return invites.stream().map(InviteMapper::toInviteDTO).toList();

    }
}
