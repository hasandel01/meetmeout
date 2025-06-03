package com.hasandel01.meetmeoutws.event;


import com.hasandel01.meetmeoutws.user.UserDTO;
import lombok.Builder;

@Builder
public record EventChatMessageDTO(UserDTO user, String message) {

}
