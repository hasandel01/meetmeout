package com.hasandel01.meetmeoutserver.user.service;


import com.hasandel01.meetmeoutserver.user.dto.UserDTO;

import org.springframework.web.multipart.MultipartFile;


public interface UserService {

    UserDTO getMe();

    String updateProfilePicture(MultipartFile file);

    UserDTO getUserByUsername(String username);

    UserDTO updateMe(UserDTO userDTO);

    Boolean updateLocationPreference(Boolean locationPreference);

    Boolean updateDarkModePreference(Boolean darkMode);
}
