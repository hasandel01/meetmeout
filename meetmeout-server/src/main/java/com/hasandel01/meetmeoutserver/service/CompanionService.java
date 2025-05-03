package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.mappers.EventMapper;
import com.hasandel01.meetmeoutserver.mappers.FriendRequestMapper;
import com.hasandel01.meetmeoutserver.mappers.UserMapper;
import com.hasandel01.meetmeoutserver.models.FriendRequest;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanionService {

    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;


    public List<UserDTO> getFriends(String username) {

        User user = (User) userDetailsService.loadUserByUsername(username);

        Set<User> friends = friendRequestRepository.findAcceptedFriends(user.getId());

        if(friends.isEmpty())
            return new ArrayList<>();

        return friends.stream()
                .map(friend -> UserDTO.builder()
                        .id(friend.getId())
                        .username(friend.getUsername())
                        .firstName(friend.getFirstName())
                        .lastName(friend.getLastName())
                        .email(friend.getEmail())
                        .companions(UserMapper.toUserDTOSet(friend.getCompanions()))
                        .participatedEventIds(friend.getParticipatedEvents().stream().map(Event::getId).collect(Collectors.toSet()))
                        .organizedEventIds(friend.getOrganizedEvents().stream().map(Event::getId).collect(Collectors.toSet()))
                        .profilePictureUrl(friend.getProfilePictureUrl())
                        .phone(friend.getPhone())
                        .about(friend.getAbout())
                        .build())
                .collect(Collectors.toList());
    }

    public void sendFriendRequest(String receiverEmail) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Optional<FriendRequest> existingFriendRequest = friendRequestRepository.findBySenderAndReceiver(sender, receiver);

        if (existingFriendRequest.isPresent()) {
            throw new RuntimeException("Friend request already exists");
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequest.Status.PENDING)
                .sentAt(LocalDateTime.now())
                .build();

        friendRequestRepository.save(friendRequest);

    }

    public void acceptRequest(String senderEmail) {

        String receiverUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow();
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();

        FriendRequest request = friendRequestRepository
                .findBySenderAndReceiver(sender, receiver)
                .orElseThrow(() -> new UsernameNotFoundException("Request not found"));

        request.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(request);

    }

    public void rejectRequest(String senderEmail) {

        String receiverUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User receiver = userRepository.findByEmail(receiverUsername).orElseThrow();
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();

        log.info("Rejecting request from {} to {}", senderEmail, receiverUsername);

        FriendRequest request = friendRequestRepository
                .findBySenderAndReceiver(sender, receiver)
                .orElseThrow(() -> new UsernameNotFoundException("Request not found"));

        request.setStatus(FriendRequest.Status.REJECTED);
        friendRequestRepository.save(request);
    }

    public List<FriendRequestDTO> getPendingFriendRequests() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = (User) userDetailsService.loadUserByUsername(username);

        List<FriendRequest> friendRequests = friendRequestRepository.findByReceiverAndStatus(user, FriendRequest.Status.PENDING)
                .orElse(new ArrayList<>());

        return FriendRequestMapper.toDTOList(friendRequests);

    }
}
