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
import com.hasandel01.meetmeoutserver.notification.service.NotificationService;
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
    private final NotificationService notificationService;

    @Transactional
    public List<EventCarDTO> addCarsToEvent(long eventId, List<CarDTO> cars) {

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

        boolean isOrganizer = event.getOrganizer().getUsername().equals(username);

        for (Car car : carsToAdd) {
            if (!alreadyAddedCarIds.contains(car.getId()) &&
                    car.getOwner().getUsername().equals(user.getUsername())) {

                eventCarsToSave.add(
                        EventCar.builder()
                                .event(event)
                                .car(car)
                                .rideAssignments(new HashSet<>())
                                .approved(isOrganizer)
                                .build()
                );
            }
        }

        if (eventCarsToSave.isEmpty()) {
            throw new RuntimeException("No valid cars to add. They may be already added or not owned by user.");
        }

        List<EventCar> savedCars= eventCarRepository.saveAll(eventCarsToSave);

        if (isOrganizer) {
            for (EventCar eventCar : eventCarsToSave) {
                User carOwner = eventCar.getCar().getOwner();
                if (!carOwner.getUsername().equals(username)) {
                    notificationService.sendCarAddedNotificationToOwner(carOwner, event);
                }
            }
        }
        return savedCars.stream().map(EventCarMapper::toEventCarDTO).collect(Collectors.toList());
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

    @Transactional
    public Boolean deleteEventCar(long eventCarId) {

        EventCar eventCar = eventCarRepository.findById(eventCarId)
                .orElseThrow(() -> new RuntimeException("Event car not found"));

        eventCarRepository.delete(eventCar);

        return true;
    }

    @Transactional
    public Boolean requestCarsToEvent(long eventId, List<CarDTO> cars) {
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
                                .approved(false)
                                .build()
                );
            }
        }

        if (eventCarsToSave.isEmpty()) {
            return false;
        }

        eventCarRepository.saveAll(eventCarsToSave);
        eventCarsToSave.forEach(car ->
                notificationService.sendCarApprovalNotificationToOrganizer(car, car.getCar().getOwner()));

        return true;
    }

    @Transactional
    public void approveEventCar(long eventCarId) {
        EventCar eventCar = eventCarRepository.findById(eventCarId)
                .orElseThrow(() -> new RuntimeException("EventCar not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!eventCar.getEvent().getOrganizer().getUsername().equals(username)) {
            throw new RuntimeException("Only the organizer can approve cars.");
        }

        if (eventCar.isApproved()) {
            return;
        }

        eventCar.setApproved(true);
        eventCarRepository.save(eventCar);
    }


}
