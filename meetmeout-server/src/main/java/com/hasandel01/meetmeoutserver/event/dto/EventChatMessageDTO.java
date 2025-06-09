package com.hasandel01.meetmeoutserver.event.dto;


import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record EventChatMessageDTO(UserDTO user, String message, LocalDateTime timestamp) {

}
