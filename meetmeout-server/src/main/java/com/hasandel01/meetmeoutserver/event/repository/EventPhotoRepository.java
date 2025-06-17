package com.hasandel01.meetmeoutserver.event.repository;

import com.hasandel01.meetmeoutserver.event.model.EventPhoto;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventPhotoRepository extends JpaRepository<EventPhoto, Long> {
    List<EventPhoto> findByUploadedBy(User uploadedBy);
}
