package com.hasandel01.meetmeoutserver.user.service.impl;


import com.hasandel01.meetmeoutserver.companion.model.FriendRequest;
import com.hasandel01.meetmeoutserver.companion.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.notification.repository.NotificationRepository;
import com.hasandel01.meetmeoutserver.user.dto.TravelAssociateDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.model.UserReview;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.common.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.common.service.EmailSenderService;
import com.hasandel01.meetmeoutserver.user.repository.UserReviewRepository;
import com.hasandel01.meetmeoutserver.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final UserDetailsService userDetailsService;

    private final CloudStorageService cloudStorageService;

    private final EmailSenderService emailSenderService;

    private final UserReviewRepository userReviewRepository;

    private final FriendRequestRepository friendRequestRepository;

    private final NotificationRepository notificationRepository;

    @Transactional
    public UserDTO getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = (User) userDetailsService.loadUserByUsername(username);
        return UserMapper.toUserDTO(user);
    }

    public String updateProfilePicture(MultipartFile file) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = (User) userDetailsService.loadUserByUsername(username);

        String imageUrl = cloudStorageService.uploadProfilePicture(file);
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }

    @Transactional
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return UserMapper.toUserDTO(user);
    }

    @Transactional
    public UserDTO updateMe(UserDTO userDTO) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        Optional<User> anyOtherUser = userRepository.findByEmail(userDTO.email());

        if(anyOtherUser.isPresent() && !anyOtherUser.get().getId().equals(user.getId())) {
            throw new UserIsRegisteredException("User already registered");
        } else {

            if(!user.getEmail().equals(userDTO.email())) {

                String verificationToken = UUID.randomUUID().toString();

                emailSenderService.sendEmail(userDTO.email(), "Please verify your email",
                        "Click the link to verify your account: https://meetmeout.vercel.app/verify?token=" + verificationToken);

                user.setEmail(userDTO.email());
                user.setVerificationToken(verificationToken);
                user.setEmailVerified(false);
            }

            user.setUsername(userDTO.username());
            user.setPhone(userDTO.phone());
            user.setAbout(userDTO.about());
            user.setFirstName(userDTO.firstName());
            user.setLastName(userDTO.lastName());

            userRepository.save(user);
        }

        return UserMapper.toUserDTO(user);
    }

    @Transactional
    public Boolean updateLocationPreference(Boolean locationPreference) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        user.setShowLocation(locationPreference);

        return userRepository.save(user).getShowLocation();
    }

    @Transactional
    public Boolean updateDarkModePreference(Boolean darkModePreference) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        user.setDarkMode(darkModePreference);

        return userRepository.save(user).getDarkMode();
    }


    @Transactional
    public Double getAverageRating(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        List<UserReview> userReviewList = userReviewRepository.findByUser(user);

        return userReviewList.stream().mapToDouble(UserReview::getRating).average().orElse(0);
    }

    @Transactional
    public Boolean deleteMyself() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        for (Event organized : user.getOrganizedEvents()) {
            organized.setOrganizer(null);
        }

        user.getCars().clear();

        for (Event event : user.getParticipatedEvents()) {
            event.getAttendees().remove(user);
        }

        user.getBadges().clear();

        friendRequestRepository.deleteAllByUserInvolved(user.getId());

        notificationRepository.deleteAllReceiverNotifications(user.getId());

        userRepository.delete(user);
        return true;
    }

    @Transactional
    public List<TravelAssociateDTO> getTravelAssociates(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        Set<Event> participatedEvents =  user.getParticipatedEvents();
        Map<String, TravelAssociateDTO> associateMap = new HashMap<>();

        for(Event event: participatedEvents) {
            for(User attendee: event.getAttendees()) {

                if(attendee.getUsername().equals(user.getUsername())) {
                    continue;
                }

                String attendeeUsername = attendee.getUsername();

                if (associateMap.containsKey(attendeeUsername)) {
                    TravelAssociateDTO existing = associateMap.get(attendeeUsername);
                    existing.setNumber(existing.getNumber() + 1);
                } else {
                    associateMap.put(attendeeUsername, TravelAssociateDTO.builder()
                            .user(UserMapper.toUserDTO(attendee))
                            .number(1)
                            .build());
                }


            }
        }

        List<TravelAssociateDTO> associateList = new ArrayList<>(associateMap.values());

        return  associateList.stream()
                .sorted(Comparator.comparingInt(TravelAssociateDTO::getNumber).reversed())
                .collect(Collectors.toList());
    }

    @Transactional
    public List<UserDTO> getUsersByIds(List<Long> ids) {
        List<User> users = userRepository.findAllById(ids);
        return users.stream()
                .map(UserMapper::toUserDTO)
                .toList();
    }

}
