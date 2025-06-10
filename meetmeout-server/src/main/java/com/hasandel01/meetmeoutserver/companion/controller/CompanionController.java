package com.hasandel01.meetmeoutserver.companion.controller;


import com.hasandel01.meetmeoutserver.companion.dto.RecommendedFriendDTO;
import com.hasandel01.meetmeoutserver.companion.service.CompanionService;
import com.hasandel01.meetmeoutserver.companion.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companions")
@RequiredArgsConstructor
public class CompanionController {

    private final CompanionService companionService;

    @PostMapping("/{receiverEmail}")
    public ResponseEntity<Boolean> addFriend(@PathVariable String receiverEmail) {
        return ResponseEntity.ok(companionService.sendFriendRequest(receiverEmail));
    }

    @PostMapping("/{senderEmail}/accept")
    public ResponseEntity<Boolean> acceptFriendRequest(@PathVariable String senderEmail) {
        return ResponseEntity.ok(companionService.acceptRequest(senderEmail));
    }

    @PostMapping("/{senderEmail}/reject")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable String senderEmail) {
        return ResponseEntity.ok(companionService.rejectRequest(senderEmail));
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<UserDTO>> getCompanions(@PathVariable String username) {
        return ResponseEntity.ok(companionService.getUserFriends(username));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequests() {
        return ResponseEntity.ok(companionService.getPendingFriendRequests());
    }

    @DeleteMapping("/{companionEmail}")
    public ResponseEntity<Boolean> removeCompanion(@PathVariable String companionEmail) {
        return ResponseEntity.ok(companionService.removeCompanion(companionEmail));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendedFriendDTO>> getRecommendedFriends() {
        return ResponseEntity.ok(companionService.getRecommendedFriends());
    }

    @GetMapping("/request-sent")
    public ResponseEntity<List<UserDTO>> getRequestSentUsers() {
        return ResponseEntity.ok(companionService.getUsersThatFriendRequestIsAlreadySent());
    }

    @DeleteMapping("/{companionEmail}/cancel-request")
    public ResponseEntity<Boolean> cancelCompanionRequest(@PathVariable String companionEmail) {
        return ResponseEntity.ok(companionService.cancelSentRequest(companionEmail));
    }

    @GetMapping("/{username}/status")
    public ResponseEntity<FriendRequestDTO> getCompanionStatus(@PathVariable String username) {
        return ResponseEntity.ok(companionService.getCompanionStatus(username));
    }

}
