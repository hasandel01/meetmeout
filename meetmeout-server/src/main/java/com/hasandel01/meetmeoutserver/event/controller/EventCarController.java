package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.EventCarDTO;
import com.hasandel01.meetmeoutserver.event.service.EventCarService;
import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/events/car")
public class EventCarController {

    private final EventCarService eventCarService;

    @PostMapping("/{eventId}/add")
    public ResponseEntity<List<EventCarDTO>> addCars(@PathVariable long eventId, @RequestBody List<CarDTO> cars) {
        return ResponseEntity.ok(eventCarService.addCarsToEvent(eventId,cars));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<List<EventCarDTO>> getCar(@PathVariable long eventId) {
        return ResponseEntity.ok(eventCarService.getAllTheCarsForTheEvent(eventId));
    }

    @PostMapping("/{eventCarId}/passengers")
    public ResponseEntity<Boolean> addPassengersToEventCar(@PathVariable long eventCarId, @RequestBody List<Long> ids) {
        return ResponseEntity.ok(eventCarService.addPassengers(eventCarId, ids));
    }

    @DeleteMapping("/{eventCarId}")
    public ResponseEntity<Boolean> deleteEventCar(@PathVariable long eventCarId) {
        return ResponseEntity.ok(eventCarService.deleteEventCar(eventCarId));
    }

    @PostMapping("/{eventId}/request")
    public ResponseEntity<Boolean> requestCarForApproval(@PathVariable long eventId, @RequestBody List<CarDTO> cars) {
        return ResponseEntity.ok(eventCarService.requestCarsToEvent(eventId, cars));
    }

    @PutMapping("/{eventCarId}/approve")
    public ResponseEntity<Void> approveEventCar(@PathVariable long eventCarId) {
        eventCarService.approveEventCar(eventCarId);
        return ResponseEntity.ok().build();
    }



}
