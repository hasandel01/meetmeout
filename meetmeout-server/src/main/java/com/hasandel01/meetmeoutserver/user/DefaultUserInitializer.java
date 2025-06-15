package com.hasandel01.meetmeoutserver.user;

import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DefaultUserInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${profile.pictureUrl}")
    private String defaultProfilePictureUrl;

    public DefaultUserInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initDefaultUser() {
        String defaultUsername = "default";

        boolean exists = userRepository.findByUsername(defaultUsername)
                .isPresent();

        if (!exists) {
            User defaultUser = new User();
            defaultUser.setUsername(defaultUsername);
            defaultUser.setFirstName("Default");
            defaultUser.setLastName("User");
            defaultUser.setEmail("default@system.com");
            defaultUser.setPassword(passwordEncoder.encode("defaultpass"));
            defaultUser.setAbout("This is a placeholder organizer.");
            defaultUser.setShowLocation(false);
            defaultUser.setProfilePictureUrl(defaultProfilePictureUrl);
            userRepository.save(defaultUser);
        }
    }
}
