package com.hasandel01.meetmeoutserver.models;

import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.dto.UserDTO;

import java.util.Set;

public record GlobalSearchResponse(Set<EventDTO> events, Set<UserDTO> users) {
}
