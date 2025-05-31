package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.AccessTokenDTO;
import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.event.dto.InviteDTO;
import com.hasandel01.meetmeoutserver.event.dto.JoinRequestDTO;
import com.hasandel01.meetmeoutserver.event.service.EventService;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventParticipantController {


    private final EventService eventService;


    @PostMapping("/{eventId}/verify-access")
    public ResponseEntity<Void> verifyAccessTokenForEvent(@PathVariable long eventId,
                                                          @RequestBody AccessTokenDTO tokenDTO) {
        return ResponseEntity.ok(eventService.verifyAccessTokenForEvent(eventId,tokenDTO));
    }

    @PostMapping("/{eventId}/join")
    public ResponseEntity<Boolean> joinEvent(@PathVariable long eventId) {
        return ResponseEntity.ok(eventService.join(eventId));
    }

    @PostMapping("/{eventId}/{username}/accept-request")
    public ResponseEntity<Void> acceptJoinRequest(@PathVariable long eventId, @PathVariable String username) {
        return ResponseEntity.ok(eventService.acceptJoinRequest(eventId,username));
    }

    @PostMapping("/{eventId}/leave")
    public ResponseEntity<Void> leaveEvent(@PathVariable long eventId) {
        return ResponseEntity.ok(eventService.leaveEvent(eventId));
    }

    @PostMapping("/{eventId}/invite")
    public ResponseEntity<Void> sendInvitation(@RequestBody List<UserDTO> users, @PathVariable long eventId) {
        return ResponseEntity.ok(eventService.sendInvitationToUsers(users,eventId));
    }

    @GetMapping("/invitations")
    public ResponseEntity<List<InviteDTO>> getInvitations() {
        return ResponseEntity.ok(eventService.getInvitations());
    }

    @GetMapping("/{eventId}/join-requests")
    public ResponseEntity<List<JoinRequestDTO>> getAllJoinRequestsForEvent(@PathVariable long eventId) {
        return ResponseEntity.ok(eventService.getAllJoinRequests(eventId));
    }

    @GetMapping("/request-sent")
    public ResponseEntity<List<EventDTO>> getAllRequestSentEvents() {
        return ResponseEntity.ok(eventService.getAllRequestSentEvents());
    }

}
