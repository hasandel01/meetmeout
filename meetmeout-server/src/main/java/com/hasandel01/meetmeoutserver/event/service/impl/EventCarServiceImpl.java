package com.hasandel01.meetmeoutserver.event.service.impl;

import com.hasandel01.meetmeoutserver.event.dto.EventCarDTO;
import com.hasandel01.meetmeoutserver.event.mapper.EventCarMapper;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.EventCar;
import com.hasandel01.meetmeoutserver.event.model.RideAssignment;
import com.hasandel01.meetmeoutserver.event.repository.EventCarRepository;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.event.repository.RideAssignmentRepository;
import com.hasandel01.meetmeoutserver.event.service.EventCarService;
import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.model.Car;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.CarRepository;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventCarServiceImpl implements EventCarService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventCarRepository eventCarRepository;
    private final CarRepository carRepository;
    private final RideAssignmentRepository rideAssignmentRepository;

    @Transactional
    public Boolean addCarsToEvent(long eventId, List<CarDTO> cars) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Car> carsToAdd = cars.stream()
                .map(dto -> carRepository.findById(dto.id())
                        .orElseThrow(() -> new RuntimeException("Car not found: " + dto.id())))
                .toList();

        List<EventCar> existingCars = eventCarRepository.findByEvent(event);

        Set<Long> alreadyAddedCarIds = existingCars.stream()
                .map(ec -> ec.getCar().getId())
                .collect(Collectors.toSet());

        List<EventCar> eventCarsToSave = new ArrayList<>();

        for (Car car : carsToAdd) {
            if (!alreadyAddedCarIds.contains(car.getId())
                    && car.getOwner().getUsername().equals(user.getUsername())) {
                eventCarsToSave.add(
                        EventCar.builder()
                                .event(event)
                                .car(car)
                                .build()
                );
            }
        }

        if (eventCarsToSave.isEmpty()) {
            return false;
        }

        eventCarRepository.saveAll(eventCarsToSave);
        return true;
    }


    @Transactional
    public List<EventCarDTO> getAllTheCarsForTheEvent(long evenId) {

        Event event = eventRepository.findById(evenId).orElseThrow(() -> new RuntimeException("Event not found"));

        List<EventCar> eventCars = eventCarRepository.findByEvent(event);

        if(eventCars.isEmpty()) {
            return new ArrayList<>();
        }
        else {
            return eventCars.stream().map(EventCarMapper::toEventCarDTO).collect(Collectors.toList());
        }

    }

    @Transactional
    public Boolean addPassengers(long eventCarId, List<Long> ids) {

        EventCar eventCar = eventCarRepository.findById(eventCarId)
                .orElseThrow(() -> new RuntimeException("Event car not found"));

        List<User> passengers = userRepository.findAllById(ids);

        for (User passenger : passengers) {
            RideAssignment rideAssignment = new RideAssignment();
            rideAssignment.setEventCar(eventCar);
            rideAssignment.setPassenger(passenger);

            rideAssignmentRepository.save(rideAssignment);
        }

        eventCarRepository.save(eventCar);
        return true;
    }

}
