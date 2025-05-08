package com.hasandel01.meetmeoutserver.dto;


import lombok.Builder;

@Builder
public record EventChatMessageDTO(UserDTO user, String message) {

}
