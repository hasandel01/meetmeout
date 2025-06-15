package com.hasandel01.meetmeoutserver.companion.service;


import com.hasandel01.meetmeoutserver.companion.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.companion.dto.RecommendedFriendDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface CompanionService {

    List<UserDTO> getFriends();

    boolean sendFriendRequest(String receiverEmail);

    boolean acceptRequest(String senderEmail);

    Void rejectRequest(String senderEmail);

    List<FriendRequestDTO> getPendingFriendRequests();

    Boolean removeCompanion(String companionEmail);

    List<RecommendedFriendDTO> getRecommendedFriends(Pageable pageable);

    List<UserDTO> getUsersThatFriendRequestIsAlreadySent();

    Boolean cancelSentRequest(String companionEmail);

    List<UserDTO> getUserFriends(String username);

    FriendRequestDTO getCompanionStatus(String username);
}
