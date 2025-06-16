package com.hasandel01.meetmeoutserver.event.mapper;


import com.hasandel01.meetmeoutserver.event.dto.InviteDTO;
import com.hasandel01.meetmeoutserver.event.model.Invite;

public class InviteMapper {

    public static InviteDTO toInviteDTO(Invite invite) {

        return InviteDTO
                .builder()
                .eventId(invite.getEvent().getId())
                .receiverId(invite.getInvited().getId())
                .senderId(invite.getInviter().getId())
                .status(invite.getStatus())
                .token(invite.getInviteToken())
                .build();
    }
}
