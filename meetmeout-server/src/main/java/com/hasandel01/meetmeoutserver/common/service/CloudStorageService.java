package com.hasandel01.meetmeoutserver.common.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CloudStorageService {

    private final Cloudinary cloudinary;

    public String uploadProfilePicture(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "meetmeout/profile_pics",
                    "overwrite", true,
                    "resource_type", "image"
            ));

            return uploadResult.get("secure_url").toString();
        }
        catch (IOException e) {
            throw new RuntimeException("Upload failed", e);
        }
    }

    public String uploadEventPicture(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "meetmeout/event_pics",
                    "overwrite", true,
                    "resource_type", "image"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Upload failed", e);
        }
    }


    public Set<String> uploadEventPictures(MultipartFile[] files) {
        try {

            Set<String> urls = new HashSet<>();

            for(MultipartFile file : files) {

                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "meetmeout/event_based_pics",
                        "overwrite", true,
                        "resource_type", "image"
                ));

                urls.add(uploadResult.get("secure_url").toString());
            }

            return urls;
        }
        catch (IOException e){
            throw new RuntimeException("Upload failed", e);
        }
    }
}
