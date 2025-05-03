package com.hasandel01.meetmeoutserver.controller;


import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.event.Event;
import com.hasandel01.meetmeoutserver.service.CloudStorageService;
import com.hasandel01.meetmeoutserver.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;


    @PostMapping("/create-event")
    public ResponseEntity<Event> createEvent(@ModelAttribute EventDTO eventDTO) {

        try {
            return new ResponseEntity<>(eventService.createEvent(eventDTO), HttpStatus.CREATED);
        } catch (UsernameNotFoundException e ) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }


    }

    @GetMapping("/get-ongoing-events")
    public ResponseEntity<Set<EventDTO>> getAllOngoingEvents() {
        try {
            return ResponseEntity.ok(eventService.getOngoingEvents());
        } catch (UsernameNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @PostMapping("/update/event-picture/{eventId}")
    public ResponseEntity<Void> updateEventPicture(@PathVariable long eventId, @RequestParam MultipartFile file) {

        try {
            return ResponseEntity.ok(eventService.updateEventPicture(eventId,file));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

}
