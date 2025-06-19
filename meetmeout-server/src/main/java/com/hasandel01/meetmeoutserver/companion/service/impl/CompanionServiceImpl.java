package com.hasandel01.meetmeoutserver.companion.service.impl;


import com.hasandel01.meetmeoutserver.companion.dto.RecommendedFriendDTO;
import com.hasandel01.meetmeoutserver.companion.model.FriendRequest;
import com.hasandel01.meetmeoutserver.companion.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.companion.mapper.FriendRequestMapper;
import com.hasandel01.meetmeoutserver.companion.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.companion.service.CompanionService;
import com.hasandel01.meetmeoutserver.enums.BadgeType;
import com.hasandel01.meetmeoutserver.enums.Categories;
import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.event.mapper.EventMapper;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.exceptions.RequestAlreadyExists;
import com.hasandel01.meetmeoutserver.notification.service.NotificationService;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.user.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CompanionServiceImpl implements CompanionService {

    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final NotificationService notificationService;
    private final BadgeService badgeService;
    private final EventRepository eventRepository;

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
    public List<RecommendedFriendDTO> getRecommendedFriends(Pageable pageable) {

        List<UserDTO> possibleCompanions = getPossibleFriends(pageable);

        Map<String, List<UserDTO>> friendCache = new HashMap<>();

        for (UserDTO userDTO : possibleCompanions) {
            List<UserDTO> friendsOfUser = getUserDTOS(userDTO.username());
            friendCache.put(userDTO.username(), friendsOfUser);
        }
        List<RecommendedFriendDTO> recommendedFriends = new ArrayList<>();

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new UsernameNotFoundException("User not found")
        );

        List<UserDTO> friends = getFriends();

        for (UserDTO companion : possibleCompanions) {

            List<UserDTO> companionFriends = friendCache.getOrDefault(companion.username(),
                        Collections.emptyList());

            List<UserDTO> mutualFriends = friends.stream()
                    .filter(companionFriends::contains)
                    .toList();

            boolean hasMutualFriends = !mutualFriends.isEmpty();

            List<EventDTO> mutualEvents = user.getParticipatedEvents().stream()
                    .filter(event -> companion.participatedEventIds().contains(event.getId()))
                    .map(EventMapper::toEventDto)
                    .toList();


            boolean hasMutualEvents = !mutualEvents.isEmpty();

            RecommendedFriendDTO.RecommendedFriendDTOBuilder builder = RecommendedFriendDTO.builder()
                    .user(companion)
                    .mutualFriends(mutualFriends)
                    .sharedEvents(mutualEvents);


            List<Event> companionEvents = eventRepository.findAllById(companion.participatedEventIds());

            Set<Categories> companionCategories = companionEvents.stream()
                    .map(Event::getCategory)
                    .collect(Collectors.toSet());

            List<EventDTO> mutualInterests = user.getParticipatedEvents().stream()
                    .filter(event -> companionCategories.contains(event.getCategory()))
                    .map(EventMapper::toEventDto)
                    .toList();

            boolean hasMutualInterests = !mutualInterests.isEmpty();

            if (hasMutualFriends) {
                if(mutualFriends.size() > 1)
                    builder.reason("You have " + mutualFriends.size() + " mutual companions.").priority(0);
                else
                    builder.reason("You have " + mutualFriends.size() + " mutual companion.").priority(0);
            } else if (hasMutualEvents) {
                if(mutualEvents.size() > 1)
                    builder.reason("You participated in " + mutualEvents.getLast().title() + " together.").priority(1);
                else
                    builder.reason("You participated in " + mutualEvents.getLast().title() + " together and more.")
                            .priority(1);
            } else if(hasMutualInterests) {
                    builder.reason("You have similar interests.").priority(2);
            }else {
                builder.reason("")
                        .priority(3);
            }

            recommendedFriends.add(builder.build());
        }

        recommendedFriends.sort(Comparator.comparingInt(RecommendedFriendDTO::priority).thenComparing(
                (a,b) -> Integer.compare(
                        b.mutualFriends().size(), a.mutualFriends().size()
                )
        ));
        return recommendedFriends;
    }

    @Transactional
    public List<UserDTO> getPossibleFriends(Pageable pageable) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = (User) userDetailsService.loadUserByUsername(username);

        List<UserDTO> companions = getFriends();

        List<FriendRequestDTO> friendRequests = getPendingFriendRequests();

        List<UserDTO> senders = friendRequests.stream().map(
                FriendRequestDTO::sender
        ).toList();

        companions.addAll(senders);
        companions.addAll(getUsersThatFriendRequestIsAlreadySent());

        Set<String> companionUsernames =
                companions.stream().map(UserDTO::username).collect(Collectors.toSet());

        return userRepository.findAll(pageable).stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !user.getUsername().equals("default"))
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
