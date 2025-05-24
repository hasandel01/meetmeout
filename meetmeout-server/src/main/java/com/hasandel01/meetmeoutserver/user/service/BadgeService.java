package com.hasandel01.meetmeoutserver.user.service;

import com.hasandel01.meetmeoutserver.enums.BadgeType;
import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.transaction.Transactional;

public interface BadgeService {

        @Transactional
        void addBadgeToUser(User user, BadgeType type);

}
