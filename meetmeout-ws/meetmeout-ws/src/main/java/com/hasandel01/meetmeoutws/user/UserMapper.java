package com.hasandel01.meetmeoutws.user;

import com.hasandel01.meetmeoutws.event.Event;
import lombok.extern.slf4j.Slf4j;

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
                .showLocation(user.getShowLocation())
                .darkMode(user.getDarkMode())
                .participatedEventIds(user.getParticipatedEvents().stream().map(Event::getId).collect(Collectors.toSet()))
                .organizedEventIds(user.getOrganizedEvents().stream().map(Event::getId).collect(Collectors.toSet()))
                .companions(user.getCompanions() != null ?
                        user.getCompanions().stream()
                                .map(UserMapper::toUserDTO)
                                .collect(Collectors.toSet())
                        : null
                )
                .build();
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
