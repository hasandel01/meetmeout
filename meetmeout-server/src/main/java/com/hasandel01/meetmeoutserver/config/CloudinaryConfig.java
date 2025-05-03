package com.hasandel01.meetmeoutserver.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "droju2iga",
                "api_key", "522419467884718",
                "api_secret", "-vsswE1L_EwbolkL8ZsfGBG4NZc"
        ));
    }
}
