package com.hasandel01.meetmeoutws.event;


import com.hasandel01.meetmeoutws.user.UserDTO;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record EventChatMessageDTO(UserDTO user, String message, LocalDateTime timestamp) {

}

