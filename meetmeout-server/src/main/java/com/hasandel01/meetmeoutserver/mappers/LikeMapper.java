package com.hasandel01.meetmeoutserver.mappers;


import com.hasandel01.meetmeoutserver.dto.LikeDTO;
import com.hasandel01.meetmeoutserver.event.Like;

public class LikeMapper {

    public static LikeDTO toLikeDTO(Like like){

        return LikeDTO
                .builder()
                .userId(like.getUser().getId())
                .eventId(like.getEvent().getId())
                .build();
    }

}
