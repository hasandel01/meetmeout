package com.hasandel01.meetmeoutserver.search;

import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;

import java.util.Set;

public record GlobalSearchResponse(Set<EventDTO> events, Set<UserDTO> users) {
}
