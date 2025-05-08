package com.hasandel01.meetmeoutserver.mappers;


import com.hasandel01.meetmeoutserver.dto.LikeDTO;
import com.hasandel01.meetmeoutserver.event.Like;

public class LikeMapper {

    public static LikeDTO toLikeDTO(Like like){

        return LikeDTO
                .builder()
                .username(like.getUser().getUsername())
                .eventId(like.getEvent().getId())
                .build();
    }

}
