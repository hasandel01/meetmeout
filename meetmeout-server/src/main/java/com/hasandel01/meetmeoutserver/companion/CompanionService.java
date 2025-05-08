package com.hasandel01.meetmeoutserver.companion;


import com.hasandel01.meetmeoutserver.notification.NotificationService;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.enums.NotificationType;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.notification.Notification;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
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


@Service
@RequiredArgsConstructor
public class CompanionService {

    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final NotificationService notificationService;

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


        Notification notification = Notification.builder()
                .notificationType(NotificationType.FRIEND_REQUEST)
                .sender(sender)
                .receiver(receiver)
                .title("A new friend request.")
                .body(sender.getUsername() + " has sent you a companion request")
                .url("")
                .build();

        notificationService.sendFriendRequestNotification(sender, receiver);
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

        notificationService.sendRequestAcceptedNotification(receiver, sender);

    }

    public void rejectRequest(String senderEmail) {

        String receiverUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User receiver = userRepository.findByEmail(receiverUsername).orElseThrow();
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();

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

    public Boolean removeCompanion(String companionEmail) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User companion = userRepository.findByEmail(companionEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Companion not found"));

        friendRequestRepository.deleteAcceptedFriend(user.getId(),companion.getId());
        return true;

    }

    public List<UserDTO> getPossibleFriends() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = (User) userDetailsService.loadUserByUsername(username);

        List<User> users = userRepository.findAll();

        List<UserDTO> companions = getFriends(currentUser.getUsername());

        List<FriendRequestDTO> friendRequests = getPendingFriendRequests();

        List<UserDTO> senders = friendRequests.stream().map(
                request -> UserMapper.toUserDTO(request.sender())
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

    public List<UserDTO> getUsersThatFriendRequestIsAlreadySent() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = (User) userDetailsService.loadUserByUsername(username);

       List<FriendRequest> requests = friendRequestRepository
               .findBySenderAndStatus(currentUser, FriendRequest.Status.PENDING);

       return requests.stream().map(
               request -> UserMapper.toUserDTO(request.getReceiver())
       ).toList();


    }

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
