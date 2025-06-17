package com.hasandel01.meetmeoutserver.event.service.impl;


import com.hasandel01.meetmeoutserver.enums.BadgeType;
import com.hasandel01.meetmeoutserver.enums.InviteStatus;
import com.hasandel01.meetmeoutserver.event.controller.DescriptionRequest;
import com.hasandel01.meetmeoutserver.event.dto.*;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.event.mapper.*;
import com.hasandel01.meetmeoutserver.event.model.*;
import com.hasandel01.meetmeoutserver.event.repository.*;
import com.hasandel01.meetmeoutserver.event.service.EventService;
import com.hasandel01.meetmeoutserver.exceptions.EventNotFoundException;
import com.hasandel01.meetmeoutserver.exceptions.InvalidTokenException;
import com.hasandel01.meetmeoutserver.exceptions.RestrictedUserException;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.common.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.notification.service.NotificationService;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.user.service.BadgeService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.web.multipart.MultipartFile;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CloudStorageService cloudStorageService;
    private final NotificationService notificationService;
    private final LikeRepository likeRepository;
    private final JoinEventRequestRepository joinEventRequestRepository;
    private final InviteRepository inviteRepository;
    private final BadgeService badgeService;

    @Transactional
    public EventDTO createEvent(EventDTO event) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        String imageUrl = cloudStorageService.uploadEventPicture(event.eventImage());

        Set<User> attendees = new HashSet<>();
        attendees.add(user);

        Event newEvent = Event.builder()
                .title(event.title())
                .description(event.description())
                .startDate(event.startDate())
                .endDate(event.endDate())
                .startTime(event.startTime())
                .endTime(event.endTime())
                .longitude(event.longitude())
                .latitude(event.latitude())
                .endLatitude(event.endLatitude())
                .endLongitude(event.endLongitude())
                .addressName(event.addressName())
                .endAddressName(event.endAddressName())
                .category(event.category())
                .tags(event.tags())
                .imageUrl(imageUrl)
                .eventPhotos(new HashSet<>())
                .fee(event.fee())
                .feeDescription(event.feeDescription())
                .isFeeRequired(event.isFeeRequired())
                .isCapacityRequired(event.isCapacityRequired())
                .organizer(user)
                .attendees(attendees)
                .maximumCapacity(event.maximumCapacity())
                .isPrivate(event.isPrivate())
                .isDraft(event.isDraft())
                .status((event.maximumCapacity() == attendees.size()) ? EventStatus.FULL : EventStatus.ONGOING)
                .comments(new HashSet<>())
                .likes(new HashSet<>())
                .reviews(new HashSet<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .routeType(event.routeType())
                .routeJson(event.routeJson())
                .build();

        newEvent = eventRepository.save(newEvent);
        notificationService.sendEventCreatedNotificationToCompanions(user,newEvent);

        if(user.getOrganizedEvents().size() == 1)
            badgeService.addBadgeToUser(user, BadgeType.FIRST_ORGANIZER);

        return EventMapper.toEventDto(newEvent);
    }

    @Transactional
    public String updateEventPicture(long eventId, MultipartFile file) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String imageUrl = cloudStorageService.uploadProfilePicture(file);

        event.setImageUrl(imageUrl);

        eventRepository.save(event);

        return imageUrl;
    }

    @Transactional
    public Set<EventDTO> getEvents(EventStatus status) {
        if (status == null) {
            return EventMapper.toEventsDto(eventRepository.findAll());
        } else {
            return EventMapper.toEventsDto( eventRepository.findByStatus(status));
        }
    }


    @Transactional
    public EventDTO getEventById(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        return EventMapper.toEventDto(event);
    }

    @Transactional
    public Boolean join(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        Optional<Invite> invite = inviteRepository.findByInvitedAndEventAndStatus(user,event,InviteStatus.PENDING);

        if(event.isPrivate() && invite.isEmpty()) {
            return sendJoinEventRequest(event);
        } else {

            if (invite.isPresent() && invite.get().getStatus() == InviteStatus.PENDING) {
                invite.get().setStatus(InviteStatus.ACCEPTED);
                inviteRepository.save(invite.get());
            }

            user.getParticipatedEvents().add(event);
            event.getAttendees().add(user);
            if(event.getAttendees().size() == event.getMaximumCapacity())
                event.setStatus(EventStatus.FULL);

            eventRepository.save(event);
            userRepository.save(user);
            if(user.getParticipatedEvents().stream()
                    .filter(participatedEvent -> !user.getOrganizedEvents().contains(participatedEvent))
                    .count() == 1)
                badgeService.addBadgeToUser(user, BadgeType.FIRST_EVENT);

            return false;
        }
    }

    @Transactional
    protected Boolean sendJoinEventRequest(Event event) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));


        JoinEventRequest joinEventRequest = JoinEventRequest.builder()
                .event(event)
                .createdAt(LocalDateTime.now())
                .sender(user)
                .build();

        joinEventRequestRepository.save(joinEventRequest);

        notificationService.sendJoinRequestToOrganizer(event,user);

        return true;
    }

    @Transactional
    public Void acceptJoinRequest(long eventId, String username) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        user.getParticipatedEvents().add(event);
        event.getAttendees().add(user);
        if(event.getAttendees().size() == event.getMaximumCapacity())
            event.setStatus(EventStatus.FULL);
        eventRepository.save(event);
        userRepository.save(user);

        notificationService.sendJoinRequestAcceptedNotification(event,user);

        List<JoinEventRequest> joinEventRequest = joinEventRequestRepository.findByEventAndSender(event,user);

        joinEventRequestRepository.deleteAll(joinEventRequest);

        if(user.getParticipatedEvents().stream()
                .filter(participatedEvent -> !user.getOrganizedEvents().contains(participatedEvent))
                .count() == 1)
            badgeService.addBadgeToUser(user, BadgeType.FIRST_EVENT);

        return null;
    }



    @Transactional
    public Void leaveEvent(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        event.getAttendees().remove(user);

        inviteRepository.findByInvitedAndEvent(user, event).ifPresent(invite -> {
            if (invite.getStatus() == InviteStatus.ACCEPTED) {
                invite.setStatus(InviteStatus.EXPIRED);
                inviteRepository.save(invite);
            }
        });

        if(event.getAttendees().size() != event.getMaximumCapacity())
            event.setStatus(EventStatus.ONGOING);

        eventRepository.save(event);
        userRepository.save(user);

        if(user.equals(event.getOrganizer())) {
            user.getOrganizedEvents().remove(event);
            event.getAttendees().clear();
            List<JoinEventRequest> joinEventRequests = joinEventRequestRepository.findByEvent(event)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            joinEventRequestRepository.deleteAll(joinEventRequests);

            cloudStorageService.deletePicture(event.getImageUrl());

            for(EventPhoto photo: event.getEventPhotos()) {
                photo.setUploadedBy(null);
                cloudStorageService.deletePicture(photo.getUrl());
                event.getEventPhotos().remove(photo);
            }

            eventRepository.delete(event);
        }
        return null;
    }

    @Transactional
    public Void likeEvent(long eventId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        Optional<Like> like = likeRepository.findByUserAndEvent(user,event);

        if(like.isPresent()) {
            likeRepository.delete(like.get());
        }else {
            Like newLike = Like.builder().user(user).event(event).build();
            likeRepository.save(newLike);
            notificationService.likeNotification(user, event);
        }

        return null;
    }


    @Transactional
    public List<JoinRequestDTO> getAllJoinRequests(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        Optional<List<JoinEventRequest>> joinEventRequests = joinEventRequestRepository.findByEvent(event);

        return joinEventRequests
                .orElse(Collections.emptyList())
                .stream()
                .map(JoinRequestMapper::toJoinRequestDTO)
                .toList();

    }

    @Transactional
    public List<EventDTO> getAllRequestSentEvents() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));


        List<JoinEventRequest> joinEventRequest = joinEventRequestRepository.findBySender(user)
                .orElse(Collections.emptyList());

        List<EventDTO> eventDTOS = new ArrayList<>();

        joinEventRequest.forEach(joinEventRequest1 ->
                eventDTOS.add(EventMapper.toEventDto(joinEventRequest1.getEvent())));

        return eventDTOS;

    }

    @Transactional
    public Void sendInvitationToUsers(List<UserDTO> users, long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        List<Long> userIds = users.stream().map(UserDTO::id).toList();


        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User sender = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));


        List<Invite> invites = inviteRepository.findByEvent(event).orElse(Collections.emptyList());

        Set<Long> alreadyInvitedUserIds = invites.stream()
                .filter(invite -> invite.getStatus() == InviteStatus.PENDING || invite.getStatus() == InviteStatus.ACCEPTED)
                .map(invite -> invite.getInvited().getId())
                .collect(Collectors.toSet());

        for(User user: userRepository.findAllById(userIds)) {

            String token = UUID.randomUUID().toString();

            if (!alreadyInvitedUserIds.contains(user.getId())) {
                Invite invite = Invite.builder()
                        .invited(user)
                        .inviter(sender)
                        .inviteToken(token)
                        .event(event)
                        .status(InviteStatus.PENDING)
                        .build();

                inviteRepository.save(invite);

                notificationService.sendUserInvitationNotification(invite);
            }
        }
        return null;
    }

    @Transactional
    public Void verifyAccessTokenForEvent(long eventId, AccessTokenDTO tokenDTO) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if(!event.isPrivate())
            return null;

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));


        if(event.getAttendees().contains(user)) {
            return null;
        } else {

            List<Invite> invites = inviteRepository.findByEvent(event)
                    .orElseThrow(() -> new RestrictedUserException(
                            "User is not invited to this event, yet tries to access it"));

            String token = tokenDTO.token();

            Optional<Invite> invite = invites.stream()
                    .filter(invite1 -> invite1.getInviteToken().equals(token))
                    .findFirst();

            if(invite.isPresent()) {
                return null;
            }
            else {
                throw new RestrictedUserException("Invalid access token");
            }
        }
    }

    @Transactional
    public List<InviteDTO> getInvitations() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found"));

        List<Invite> invites = inviteRepository.findByInvited(user)
                .orElse(Collections.emptyList());

        return invites.stream().map(InviteMapper::toInviteDTO).toList();

    }


    @Transactional
    public Set<EventDTO> getMyEvents() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return user.getParticipatedEvents().stream().map(EventMapper::toEventDto).collect(Collectors.toSet());
    }

    @Transactional
    public Set<String> uploadPhotos(@Valid MultipartFile[] files, long eventId) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        User uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Set<String> photoUrls = cloudStorageService.uploadEventPictures(files);

        for (String url : photoUrls) {
            EventPhoto photo = EventPhoto.builder()
                    .url(url)
                    .event(event)
                    .uploadedBy(uploader)
                    .uploadDateTime(LocalDateTime.now(ZoneId.of("Europe/Istanbul")))
                    .build();
            event.getEventPhotos().add(photo);
        }

        eventRepository.save(event);
        return photoUrls;
    }


    @Transactional
    public EventDTO updateEvent(long eventId, EventDTO eventDTO) throws EventNotFoundException {



        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the organizer can update this event");
        }

        String url = event.getImageUrl();

        event.setTitle(eventDTO.title());
        event.setDescription(eventDTO.description());
        event.setStartDate(eventDTO.startDate());
        event.setEndDate(eventDTO.endDate());
        event.setStartTime(eventDTO.startTime());
        event.setEndTime(eventDTO.endTime());
        event.setLongitude(eventDTO.longitude());
        event.setLatitude(eventDTO.latitude());
        event.setEndLatitude(eventDTO.endLatitude());
        event.setEndLongitude(eventDTO.endLongitude());
        event.setAddressName(eventDTO.addressName());
        event.setEndAddressName(eventDTO.endAddressName());
        event.setImageUrl(url);
        event.setCapacityRequired(eventDTO.isCapacityRequired());
        event.setMaximumCapacity(eventDTO.maximumCapacity());
        event.setFee(eventDTO.fee());
        event.setFeeDescription(eventDTO.feeDescription());
        event.setFeeRequired(eventDTO.isFeeRequired());
        event.setThereRoute(eventDTO.isThereRoute());
        event.setRouteType(eventDTO.routeType());
        event.setCategory(eventDTO.category());
        event.setTags(eventDTO.tags());
        event.setPrivate(eventDTO.isPrivate());
        event.setDraft(eventDTO.isDraft());

        return EventMapper.toEventDto(eventRepository.save(event));
    }

    @Transactional
    public List<EventDTO> getEventsByIds(Set<Long> eventIds) {
        return eventRepository.findAllById(eventIds)
                .stream()
                .map(EventMapper::toEventDto)
                .toList();
    }

    @Transactional
    public Boolean publishEvent(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        event.setDraft(false);
        eventRepository.save(event);

        return true;
    }

    @Transactional
    public Boolean changeDescription(Long eventId, DescriptionRequest description) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the organizer can update this event");
        }

        event.setDescription(description.description());
        eventRepository.save(event);
        notificationService.sendEventUpdatedNotificationToAttendees(event);

        return true;
    }

    @Transactional
    public Boolean tagsUpdate(Long eventId, TagUpdateRequest tagUpdateRequest) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the organizer can update this event");
        }

        event.setTags(tagUpdateRequest.tags());
        eventRepository.save(event);
        notificationService.sendEventUpdatedNotificationToAttendees(event);

        return true;
    }

    @Transactional
    public Boolean capacityUpdate(Long eventId, CapacityUpdateRequest capacityUpdateRequest) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if(event.getAttendees().size() > capacityUpdateRequest.maxCapacity() && event.isCapacityRequired())
            throw new RuntimeException("Capacity is full");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the organizer can update this event");
        }

        event.setCapacityRequired(capacityUpdateRequest.isCapacityRequired());
        event.setMaximumCapacity(capacityUpdateRequest.maxCapacity());

        if(event.getMaximumCapacity() == event.getAttendees().size())
                event.setStatus(EventStatus.FULL);
        else
                event.setStatus(EventStatus.ONGOING);


        eventRepository.save(event);
        notificationService.sendEventUpdatedNotificationToAttendees(event);

        return true;
    }

    @Transactional
    public List<UserDTO> getAllInvitedUsersForTheEvent(long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        List<Invite> invites = inviteRepository.findByEventAndStatus(event,InviteStatus.PENDING)
                .orElse(new ArrayList<>());

        if(!invites.isEmpty()) {
            return invites.stream().map(Invite::getInvited).map(UserMapper::toUserDTO)
                    .collect(Collectors.toList());
        } else {
            return new ArrayList<>();
        }

    }

    @Transactional
    public List<String> getRecommendedTags(String query, Pageable pageable) {
        return eventRepository.findAllDistinctTags(query, pageable);
    }

    @Transactional
    public InviteDTO getInvitationsByInvitedAndEvent(long eventId, long userId) {

        User invited = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));


        Optional<Invite> invite = inviteRepository.findByInvitedAndEvent(invited, event);

        if(invite.isPresent()) {
            return InviteMapper.toInviteDTO(invite.get());
        }
        else {
            return InviteMapper.toInviteDTO(Invite.builder().build());
        }

    }

    @Transactional
    public Void kickUser(long eventId, long userId) {

        User attendee = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!event.getOrganizer().getUsername().equals(username)) {
            throw new AccessDeniedException("Only the organizer can update this event");
        }

        if (!event.getAttendees().contains(attendee)) {
            throw new IllegalArgumentException("User is not an attendee of this event.");
        }

        event.getAttendees().remove(attendee);

        inviteRepository.findByInvitedAndEvent(attendee, event).ifPresent(invite -> {
            if (invite.getStatus() == InviteStatus.ACCEPTED) {
                invite.setStatus(InviteStatus.EXPIRED);
                inviteRepository.save(invite);
            }
        });

        eventRepository.save(event);

        notificationService.sendKickNotificationToUser(attendee,event);

        return null;
    }

    @Override
    public Boolean changePrivacy(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        event.setPrivate(!event.isPrivate());
        eventRepository.save(event);

        return true;
    }

    @Transactional
    public InviteDTO getInviteDetails(String token) {
        return inviteRepository.findByInviteToken(token)
                .stream().map(InviteMapper::toInviteDTO).findFirst().orElse(null);
    }
}

