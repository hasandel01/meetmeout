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
                .companions(user.getCompanions().stream()
                        .map(friend -> UserDTO.builder()
                                .firstName(friend.getFirstName())
                                .lastName(friend.getLastName())
                                .profilePictureUrl(friend.getProfilePictureUrl())
                                .build())
                        .collect(Collectors.toSet()))
                .build();
    }


    public static Set<UserDTO> toUserDTOSet(Set<User> users) {
        if (users == null) return null;

        return users.stream().map(UserMapper::toUserDTO).collect(Collectors.toSet());
    }


    public static List<UserDTO> toUserDTOList(List<User> users) {
        if (users == null) return null;

        return users.stream().map(UserMapper::toUserDTO).collect(Collectors.toList());
    }

}
