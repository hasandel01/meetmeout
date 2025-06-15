package com.hasandel01.meetmeoutserver.user.service;


import com.hasandel01.meetmeoutserver.user.dto.TravelAssociateDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface UserService {

    UserDTO getMe();

    String updateProfilePicture(MultipartFile file);

    UserDTO getUserByUsername(String username);

    UserDTO updateMe(UserDTO userDTO);

    Boolean updateLocationPreference(Boolean locationPreference);

    Boolean updateDarkModePreference(Boolean darkMode);

    Double getAverageRating(String username);

    Boolean deleteMyself();

    List<TravelAssociateDTO> getTravelAssociates(String username);

    List<UserDTO> getUsersByIds(List<Long> ids);
}
