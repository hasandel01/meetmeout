package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.EventPhotoDTO;
import com.hasandel01.meetmeoutserver.event.model.EventPhoto;

public class EventPhotoMapper {

    public static EventPhotoDTO toEventPhotoDTO(EventPhoto photo) {
        return new EventPhotoDTO(
                photo.getUrl(),
                photo.getUploadedBy().getUsername(),
                photo.getUploadedBy().getProfilePictureUrl(),
                photo.getUploadDateTime()
        );
    }
}
