package com.hasandel01.meetmeoutserver.common.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.*;


public interface CloudStorageService {

    String uploadProfilePicture(MultipartFile file);

    String uploadEventPicture(MultipartFile file);

    Set<String> uploadEventPictures(MultipartFile[] files);

    void deletePicture(String pictureId);
}
