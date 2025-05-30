package com.hasandel01.meetmeoutserver.companion.service.impl;


import com.hasandel01.meetmeoutserver.companion.model.FriendRequest;
import com.hasandel01.meetmeoutserver.companion.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.companion.mapper.FriendRequestMapper;
import com.hasandel01.meetmeoutserver.companion.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.companion.service.CompanionService;
import com.hasandel01.meetmeoutserver.enums.BadgeType;
import com.hasandel01.meetmeoutserver.exceptions.RequestAlreadyExists;
import com.hasandel01.meetmeoutserver.notification.service.NotificationService;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.user.service.BadgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class CompanionServiceImpl implements CompanionService {

    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final NotificationService notificationService;
    private final BadgeService badgeService;

    @Transactional
    public List<UserDTO> getFriends() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return getUserDTOS(username);
    }

    @Transactional
    public List<UserDTO> getUserFriends(String username) {
        return getUserDTOS(username);
    }

    @Transactional
    public FriendRequestDTO getCompanionStatus(String username) {

        String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(currentUserName)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User companion = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Optional<FriendRequest> friendRequest = friendRequestRepository
                .findBySenderAndReceiverOrReceiverAndSender(user,companion,user,companion);

        if(friendRequest.isPresent()) {
            return FriendRequestMapper.toDTO(friendRequest.get());
        } else {
            return FriendRequestDTO.builder().status(FriendRequest.Status.NONE).build();
        }

    }

    @NotNull
    private List<UserDTO> getUserDTOS(String username) {

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
                        .showLocation(friend.getShowLocation())
                        .darkMode(friend.getDarkMode())
                        .about(friend.getAbout())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean sendFriendRequest(String receiverEmail) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Optional<FriendRequest> existingFriendRequest = friendRequestRepository.findBySenderAndReceiver(sender, receiver);

        if (existingFriendRequest.isPresent()) {
            throw new RequestAlreadyExists("Friend request already exists");
        }

        FriendRequest friendRequest = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequest.Status.PENDING)
                .sentAt(LocalDateTime.now())
                .build();

        notificationService.sendFriendRequestNotification(sender, receiver);
        friendRequestRepository.save(friendRequest);

        return true;
    }

    @Transactional
    public boolean acceptRequest(String senderEmail) {

        String receiverUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow();
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();

        FriendRequest request = friendRequestRepository
                .findBySenderAndReceiver(sender, receiver)
                .orElseThrow(() -> new UsernameNotFoundException("Request not found"));

        request.setStatus(FriendRequest.Status.ACCEPTED);
        friendRequestRepository.save(request);

        notificationService.sendRequestAcceptedNotification(receiver, sender);


        List<FriendRequest> allSenderRequests = friendRequestRepository
                .findAllByUserInvolved(sender);

        long totalAcceptedForSender = allSenderRequests.stream()
                .filter(r -> r.getStatus() == FriendRequest.Status.ACCEPTED)
                .count();

        if (totalAcceptedForSender == 1)
            badgeService.addBadgeToUser(sender, BadgeType.FIRST_FRIEND);

        List<FriendRequest> allReceiverRequests = friendRequestRepository
                .findAllByUserInvolved(receiver);

        long totalAcceptedForReceiver = allReceiverRequests.stream()
                .filter(r -> r.getStatus() == FriendRequest.Status.ACCEPTED)
                .count();

        if (totalAcceptedForReceiver == 1)
            badgeService.addBadgeToUser(receiver, BadgeType.FIRST_FRIEND);

        return true;
    }

    @Transactional
    public Void rejectRequest(String senderEmail) {

        String receiverUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User receiver = userRepository.findByEmail(receiverUsername).orElseThrow();
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();

        FriendRequest request = friendRequestRepository
                .findBySenderAndReceiver(sender, receiver)
                .orElseThrow(() -> new UsernameNotFoundException("Request not found"));

        request.setStatus(FriendRequest.Status.REJECTED);
        friendRequestRepository.save(request);

        return null;
    }


    @Transactional
    public List<FriendRequestDTO> getPendingFriendRequests() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<FriendRequest> friendRequests = friendRequestRepository.findByReceiverAndStatus(user, FriendRequest.Status.PENDING)
                .orElse(new ArrayList<>());

        return FriendRequestMapper.toDTOList(friendRequests);

    }


    @Transactional
    public Boolean removeCompanion(String companionEmail) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User companion = userRepository.findByEmail(companionEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Companion not found"));

        friendRequestRepository.deleteAcceptedFriend(user.getId(),companion.getId());
        return true;

    }

    @Transactional
    public List<UserDTO> getPossibleFriends() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = (User) userDetailsService.loadUserByUsername(username);

        List<User> users = userRepository.findAll();

        List<UserDTO> companions = getFriends();

        List<FriendRequestDTO> friendRequests = getPendingFriendRequests();

        List<UserDTO> senders = friendRequests.stream().map(
                FriendRequestDTO::sender
        ).toList();

        companions.addAll(senders);
        companions.addAll(getUsersThatFriendRequestIsAlreadySent());

        Set<String> companionUsernames =
                companions.stream().map(UserDTO::username).collect(Collectors.toSet());

        return users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !companionUsernames.contains(user.getUsername()))
                .map(UserMapper::toUserDTO)
                .toList();
    }

    @Transactional
    public List<UserDTO> getUsersThatFriendRequestIsAlreadySent() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = (User) userDetailsService.loadUserByUsername(username);

        List<FriendRequest> requests = friendRequestRepository
                .findBySenderAndStatus(currentUser, FriendRequest.Status.PENDING);

        return requests.stream().map(
                request -> UserMapper.toUserDTO(request.getReceiver())
        ).toList();


    }

    @Transactional
    public Boolean cancelSentRequest(String companionEmail) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));


        User companion = userRepository.findByEmail(companionEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Companion not found"));

        friendRequestRepository.deleteFriendRequest(user.getId(), companion.getId());
        return true;
    }
}
