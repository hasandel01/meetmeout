package com.hasandel01.meetmeoutserver.user.repository;

import com.hasandel01.meetmeoutserver.user.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
}
