package com.hasandel01.meetmeoutserver.event.controller;

import com.hasandel01.meetmeoutserver.event.dto.*;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;


    @PostMapping
    public ResponseEntity<Long> createEvent(@Valid @ModelAttribute EventDTO eventDTO) {
        return new ResponseEntity<>(eventService.createEvent(eventDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Set<EventDTO>> getAllOngoingEvents(@RequestParam(required = false) EventStatus status) {
        return ResponseEntity.ok(eventService.getEvents(status));
    }

    @GetMapping("/mine")
    public ResponseEntity<Set<EventDTO>> getAllMyEvents() {
        return ResponseEntity.ok(eventService.getMyEvents());
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable long eventId, @Valid @ModelAttribute EventDTO eventDTO) {
        return ResponseEntity.ok(eventService.updateEvent(eventId, eventDTO));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable long eventId) {
        return ResponseEntity.ok(eventService.getEventById(eventId));
    }

    @PostMapping("/{eventId}/like")
    public ResponseEntity<Void> likeEvent(@PathVariable long eventId) {
        return ResponseEntity.ok(eventService.likeEvent(eventId));
    }

    @PostMapping("/{eventId}/photos")
    public ResponseEntity<Set<String>> uploadPhotos(@Valid MultipartFile[] files, @PathVariable long eventId) {
        return ResponseEntity.ok(eventService.uploadPhotos(files,eventId));
    }

    @GetMapping("/{eventId}/average-rating")
    public ResponseEntity<Double> getAverageRatingForEvent(@PathVariable long eventId) {
        return ResponseEntity.ok(eventService.getAverageRating(eventId));
    }

    @GetMapping("/with-ids")
    public ResponseEntity<List<EventDTO>> getEventsByIds(@RequestParam("ids") Set<Long> ids) {
        return ResponseEntity.ok(eventService.getEventsByIds(ids));
    }

    @PutMapping("/publish/{eventId}")
    public ResponseEntity<Boolean> publishDraftEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.publishEvent(eventId));
    }

    @PutMapping("/{eventId}/description")
    public ResponseEntity<Boolean> updateDescription(@PathVariable Long eventId,@RequestBody DescriptionRequest description) {
        return ResponseEntity.ok(eventService.changeDescription(eventId, description));
    }

    @PutMapping("/{eventId}/event-image")
    public ResponseEntity<String> updateEventImage(@PathVariable Long eventId, MultipartFile file) {
        return ResponseEntity.ok(eventService.updateEventPicture(eventId,file));
    }

    @PutMapping("/{eventId}/fee")
    public ResponseEntity<Boolean> updateFeeInformation(@PathVariable Long eventId,
                                                        @Validated @RequestBody FeeUpdateRequest feeUpdateRequest){
        return ResponseEntity.ok(eventService.feeUpdate(eventId,feeUpdateRequest));
    }

    @PutMapping("/{eventId}/tags")
    public ResponseEntity<Boolean> updateEventTags(@PathVariable Long eventId,
                                                   @Validated @RequestBody TagUpdateRequest tagUpdateRequest){
        return ResponseEntity.ok(eventService.tagsUpdate(eventId,tagUpdateRequest));
    }


    @PutMapping("/{eventId}/capacity")
    public ResponseEntity<Boolean> updateCapacity(@PathVariable Long eventId,
                                                  @Validated @RequestBody CapacityUpdateRequest capacityUpdateRequest) {
        return ResponseEntity.ok(eventService.capacityUpdate(eventId,capacityUpdateRequest));
    }

}
