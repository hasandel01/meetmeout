package com.hasandel01.meetmeoutserver.common.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hasandel01.meetmeoutserver.common.service.CloudStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CloudStorageServiceImpl implements CloudStorageService {

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

    @Override
    public void deletePicture(String publicUrl) {

        String pictureId = extractPublicIdFromUrl(publicUrl);

        try {
            System.out.println("Delete picture: " + pictureId);
            cloudinary.uploader().destroy(pictureId, ObjectUtils.asMap(
                    "resource_type", "image"
            ));
        } catch (IOException e) {
            throw new RuntimeException("Delete profile picture failed", e);
        }
    }

    public static String extractPublicIdFromUrl(String url) {
        String[] parts = url.split("/upload/");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid Cloudinary URL");
        }

        String withoutVersion = parts[1].replaceFirst("^v[0-9]+/", "");
        return withoutVersion.replaceAll("\\.[^.]+$", "");
    }


}
