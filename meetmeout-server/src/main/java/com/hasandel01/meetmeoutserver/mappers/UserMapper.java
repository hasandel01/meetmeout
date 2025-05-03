package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.models.User;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


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
                .bio(user.getBio())
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
                .bio(userDTO.bio())
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
