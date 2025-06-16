package com.hasandel01.meetmeoutserver.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EventPhotoDTO {
    private String url;
    private String uploadedByUsername;
    private String uploadedByProfilePictureUrl;
    private LocalDateTime uploadedDateTime;
}
