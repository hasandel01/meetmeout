package com.hasandel01.meetmeoutserver.event.mapper;


import com.hasandel01.meetmeoutserver.event.dto.LikeDTO;
import com.hasandel01.meetmeoutserver.event.model.Like;

public class LikeMapper {

    public static LikeDTO toLikeDTO(Like like){

        return LikeDTO
                .builder()
                .username(like.getUser().getUsername())
                .eventId(like.getEvent().getId())
                .build();
    }

}
