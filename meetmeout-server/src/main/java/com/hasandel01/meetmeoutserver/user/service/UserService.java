package com.hasandel01.meetmeoutserver.user.service;


import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.exceptions.UserIsRegisteredException;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.common.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.companion.CompanionService;
import com.hasandel01.meetmeoutserver.common.service.EmailSenderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final UserDetailsService userDetailsService;

    private final CloudStorageService cloudStorageService;

    private final CompanionService companionService;
    private final EmailSenderService emailSenderService;

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


        return userDTO;
    }
}
