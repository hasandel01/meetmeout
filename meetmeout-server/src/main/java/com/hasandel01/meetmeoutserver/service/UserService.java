package com.hasandel01.meetmeoutserver.service;


import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.mappers.UserMapper;
import com.hasandel01.meetmeoutserver.models.User;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final UserDetailsService userDetailsService;

    private final CloudStorageService cloudStorageService;

    private final CompanionService companionService;

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

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return UserMapper.toUserDTO(user);
    }

    public List<UserDTO> getPossibleFriends() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = (User) userDetailsService.loadUserByUsername(username);

        List<User> users = userRepository.findAll();

        List<UserDTO> companions = companionService.getFriends(currentUser.getUsername());

        Set<Long> companionIds = companions.stream().map(UserDTO::id).collect(Collectors.toSet());


        List<UserDTO> filteredUsers = users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !companionIds.contains(user.getId()))
                .map(UserMapper::toUserDTO)
                .toList();

        return filteredUsers;
    }

}
