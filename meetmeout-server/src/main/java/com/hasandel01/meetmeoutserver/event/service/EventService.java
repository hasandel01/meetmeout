package com.hasandel01.meetmeoutserver.event.service;

import com.hasandel01.meetmeoutserver.event.controller.DescriptionRequest;
import com.hasandel01.meetmeoutserver.event.dto.*;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

public interface EventService {

    @Transactional
    EventDTO createEvent(EventDTO event);

    Set<EventDTO> getEvents(EventStatus status);

    String updateEventPicture(long eventId, MultipartFile file);

    EventDTO getEventById(long eventId);

    @Transactional
    Boolean join(long eventId);

    @Transactional
    Void acceptJoinRequest(long eventId, String username);

    @Transactional
    Void leaveEvent(long eventId);

    @Transactional
    Void likeEvent(long eventId);

    List<JoinRequestDTO> getAllJoinRequests(long eventId);

    List<EventDTO> getAllRequestSentEvents();

    Void sendInvitationToUsers(List<UserDTO> users, long eventId);

    Void verifyAccessTokenForEvent(long eventId, AccessTokenDTO tokenDTO);

    List<InviteDTO> getInvitations();

    Set<EventDTO> getMyEvents();

    @Transactional
    Set<String> uploadPhotos(@Valid MultipartFile[] files, long eventId);

    EventDTO updateEvent(long eventId, EventDTO eventDTO);

    Double getAverageRating(long eventId);

    List<EventDTO> getEventsByIds(Set<Long> eventIds);

    Boolean publishEvent(Long eventId);

    Boolean changeDescription(Long eventId, DescriptionRequest description);

    Boolean tagsUpdate(Long eventId, TagUpdateRequest tagUpdateRequest);

    Boolean capacityUpdate(Long eventId, CapacityUpdateRequest capacityUpdateRequest);

    List<UserDTO> getAllInvitedUsersForTheEvent(long eventId);

    List<String> getRecommendedTags();
}
