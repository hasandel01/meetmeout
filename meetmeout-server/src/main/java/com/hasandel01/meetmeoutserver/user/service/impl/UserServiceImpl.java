package com.hasandel01.meetmeoutserver.user.service.impl;


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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final UserDetailsService userDetailsService;

    private final CloudStorageService cloudStorageService;

    private final EmailSenderService emailSenderService;

    private final UserReviewRepository userReviewRepository;

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

        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }
}
