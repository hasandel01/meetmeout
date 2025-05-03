package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.models.FriendRequest;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class FriendRequestMapper {

    public static FriendRequestDTO toDTO(FriendRequest friendRequest) {

        if(friendRequest == null) return null;

        return  FriendRequestDTO
                .builder()
                .id(friendRequest.getId())
                .sender(friendRequest.getSender())
                .receiver(friendRequest.getReceiver())
                .status(friendRequest.getStatus())
                .build();

    }


    public static List<FriendRequestDTO> toDTOList(List<FriendRequest> friendRequests) {
        if(friendRequests == null) return null;

        return friendRequests.stream().map(FriendRequestMapper::toDTO).collect(Collectors.toList());
    }
}
