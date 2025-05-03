package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.service.CompanionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
public class UserMapper {

    public static UserDTO toUserDTO(User user) {

        if (user == null) return null;

        return UserDTO.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profilePictureUrl(user.getProfilePictureUrl())
                .about(user.getAbout())
                .participatedEventIds(user.getParticipatedEvents().stream().map(Event::getId).collect(Collectors.toSet()))
                .organizedEventIds(user.getOrganizedEvents().stream().map(Event::getId).collect(Collectors.toSet()))
                .badges(user.getBadges().stream().map(BadgeMapper::toBadgeDTO).collect(Collectors.toSet()))
                .companions(user.getCompanions() != null ?
                        user.getCompanions().stream()
                                .map(UserMapper::toUserDTO)
                                .collect(Collectors.toSet())
                        : null
                )
                .build();
    }


    public static Set<UserDTO> toUserDTOSet(Set<User> users) {
        if (users == null) return null;

        return users.stream().map(UserMapper::toUserDTO).collect(Collectors.toSet());
    }

    public static User toUser(UserDTO userDTO) {
        if (userDTO == null) return null;

        return User.builder()
                .id(userDTO.id())
                .username(userDTO.username())
                .email(userDTO.email())
                .firstName(userDTO.firstName())
                .lastName(userDTO.lastName())
                .about(userDTO.about())
                .phone(userDTO.phone())
                .profilePictureUrl(userDTO.profilePictureUrl())
                .companions(userDTO.companions() != null ?
                        userDTO.companions().stream()
                                .map(UserMapper::toUser)
                                .collect(Collectors.toSet())
                        : null
                )
                .build();


    }

}
