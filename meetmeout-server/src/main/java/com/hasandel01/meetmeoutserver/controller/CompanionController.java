package com.hasandel01.meetmeoutserver.controller;


import com.hasandel01.meetmeoutserver.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.mappers.UserMapper;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import com.hasandel01.meetmeoutserver.service.CompanionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class CompanionController {

    private final CompanionService companionService;

    private final UserRepository userRepository;


    @PostMapping("/add-a-companion/{receiverEmail}")
    public ResponseEntity<Boolean> addFriend(@PathVariable String receiverEmail) {
        try {

            log.info(receiverEmail);

            companionService.sendFriendRequest(receiverEmail);
            return new ResponseEntity<>(true, HttpStatus.OK);
        }
        catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/accept-companion-request/{senderEmail}")
    public ResponseEntity<Boolean> acceptFriendRequest(@PathVariable String senderEmail) {
        try {
            companionService.acceptRequest(senderEmail);
            return new ResponseEntity<>(true, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/reject-compainon-request/{senderEmail}")
    public ResponseEntity<Boolean> rejectFriendRequest(@PathVariable String senderEmail) {
        try {
            companionService.rejectRequest(senderEmail);
            return new ResponseEntity<>(true, HttpStatus.OK);
        } catch (
                Exception e
        )
        {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/get-companions")
    public ResponseEntity<List<UserDTO>> getFriends(Principal principal) {
        String userEmail = principal.getName();
        List<UserDTO> companions = companionService.getFriends(userEmail);
        return ResponseEntity.ok(companions);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<UserDTO> getUser(@PathVariable String email) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(UserMapper.toUserDTO(user));
        }
        catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/get-pending-requests")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequests(Principal principal) {
        return ResponseEntity.ok(companionService.getPendingFriendRequests());
    }


    @GetMapping("/{username}/companions")
    public ResponseEntity<List<UserDTO>> getCompanions(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(companionService.getFriends(user.getUsername()));

    }


    @PostMapping("/remove-companion/{companionEmail}")
    public ResponseEntity<Boolean> removeCompanion(@PathVariable String companionEmail) {
        try {
            return ResponseEntity.ok(companionService.removeCompanion(companionEmail));
        }catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/get-possible-friends")
    public ResponseEntity<List<UserDTO>> getPossibleFriends() {
        try {
            return ResponseEntity.ok(companionService.getPossibleFriends());
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/get-request-sent-users")
    public ResponseEntity<List<UserDTO>> getRequestSentUsers() {
        try {
            return ResponseEntity.ok(companionService.getUsersThatFriendRequestIsAlreadySent());
        } catch (RuntimeException e ) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @DeleteMapping("/cancel-companion-request/{companionEmail}")
    public ResponseEntity<Boolean> cancelCompanionRequest(@PathVariable String companionEmail) {
        try {
            return ResponseEntity.ok(companionService.cancelSentRequest(companionEmail));
        } catch (RuntimeException e){
            return ResponseEntity.internalServerError().build();
        }
    }

}
