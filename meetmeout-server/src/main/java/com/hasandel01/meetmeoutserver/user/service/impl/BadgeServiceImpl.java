package com.hasandel01.meetmeoutserver.user.service.impl;


import com.hasandel01.meetmeoutserver.enums.BadgeType;
import com.hasandel01.meetmeoutserver.user.model.Badge;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.user.service.BadgeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeServiceImpl implements BadgeService {

    private final UserRepository  userRepository;

    @Transactional
    public void addBadgeToUser(User user, BadgeType type) {

        boolean alreadyHasPioneer = user.getBadges().stream().anyMatch(
                badge -> badge.getTitle().equals("Pioneer!"));

        boolean alreadyHasHello = user.getBadges().stream().anyMatch(
                badge -> badge.getTitle().equals("Hello world!"));

        boolean alreadyHasSocialSpark = user.getBadges().stream().anyMatch(
                badge -> badge.getTitle().equals("Social Spark!"));

        Badge badge = null;

        if(type == BadgeType.FIRST_ORGANIZER && !alreadyHasPioneer) {

            badge = Badge
                    .builder()
                    .title("Pioneer!")
                    .description("You organized your first event")
                    .iconUrl("https://res.cloudinary.com/droju2iga/image/upload/v1747950100/pioneer_appmmx.png")
                    .createdAt(LocalDateTime.now())
                    .build();

        }
        else if(type == BadgeType.FIRST_EVENT && !alreadyHasHello) {

            badge= Badge
                    .builder()
                    .title("Hello world!")
                    .description("Your first event as an attendee.")
                    .iconUrl("https://res.cloudinary.com/droju2iga/image/upload/v1747949977/hello_world_jm9o37.png")
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        else if(type == BadgeType.FIRST_FRIEND && !alreadyHasSocialSpark) {


            badge= Badge
                    .builder()
                    .title("Social Spark!")
                    .description("You started having companions.")
                    .iconUrl("https://res.cloudinary.com/droju2iga/image/upload/v1747950084/social_spark_kjg6p6.png")
                    .createdAt(LocalDateTime.now())
                    .build();

        }

        user.getBadges().add(badge);
        userRepository.save(user);

    }

}
