package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.*;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.service.EventService;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;


    @PostMapping("/create-event")
    public ResponseEntity<Long> createEvent(@Validated @ModelAttribute EventDTO eventDTO) {

        try {
            return new ResponseEntity<>(eventService.createEvent(eventDTO), HttpStatus.CREATED);
        } catch (UsernameNotFoundException e ) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/get-events")
    public ResponseEntity<Set<EventDTO>> getAllOngoingEvents(@RequestParam(required = false) EventStatus status) {
        try {
            return ResponseEntity.ok(eventService.getEvents(status));
        } catch (UsernameNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/update/event-picture/{eventId}")
    public ResponseEntity<Void> updateEventPicture(@PathVariable long eventId, @RequestParam MultipartFile file) {

        try {
            return ResponseEntity.ok(eventService.updateEventPicture(eventId,file));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @GetMapping("/get-event/{eventId}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.getEventById(eventId));
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping("/join-event/{eventId}")
    public ResponseEntity<Void> joinEvent(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.join(eventId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/accept-join-request/{eventId}/{username}")
    public ResponseEntity<Void> acceptJoinRequest(@PathVariable long eventId, @PathVariable String username) {
        try {
            return ResponseEntity.ok(eventService.acceptJoinRequest(eventId,username));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/leave-event/{eventId}")
    public ResponseEntity<Void> leaveEvent(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.leaveEvent(eventId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/like-event/{eventId}")
    public ResponseEntity<Void> likeEvent(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.likeEvent(eventId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/add-review/{eventId}")
    public ResponseEntity<Void> addReview(@Valid @PathVariable long eventId, @RequestBody ReviewDTO reviewDTO) {
        try {
            return ResponseEntity.ok(eventService.addReviewToEvent(eventId, reviewDTO));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/delete-review/{eventId}")
    public ResponseEntity<Void> deleteReview(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.deleteReviewFromEvent(eventId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/add-comment/{eventId}")
    public ResponseEntity<Void> addComment(@Valid @PathVariable long eventId, @RequestBody CommentDTO comment) {
        try {
            return ResponseEntity.ok(eventService.addComment(eventId, comment));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/delete-comment/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable long commentId) {
        try {
            return ResponseEntity.ok(eventService.deleteComment(commentId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/get-join-requests/{eventId}")
    public ResponseEntity<List<JoinRequestDTO>> getAllJoinRequestsForEvent(@PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.getAllJoinRequests(eventId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/get-request-sent-events")
    public ResponseEntity<List<EventDTO>> getAllRequestSentEvents() {
        try {
            return ResponseEntity.ok(eventService.getAllRequestSentEvents());
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/send-invitation/{eventId}")
    public ResponseEntity<Void> sendInvitation(@RequestBody List<UserDTO> users, @PathVariable long eventId) {
        try {
            return ResponseEntity.ok(eventService.sendInvitationToUsers(users,eventId));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @PostMapping("/verify-access-to-event/{eventId}")
    public ResponseEntity<Void> verifyAccessTokenForEvent(@PathVariable long eventId,
    @RequestBody Map<String,String> payload) {
        try {
            return ResponseEntity.ok(eventService.verifyAccessTokenForEvent(eventId,payload));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/get-invitations")
    public ResponseEntity<List<InviteDTO>> getInvitations() {
        try {
            return ResponseEntity.ok(eventService.getInvitations());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}
