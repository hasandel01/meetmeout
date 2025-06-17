package com.hasandel01.meetmeoutserver.user.service.impl;


import com.hasandel01.meetmeoutserver.event.model.EventCar;
import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.mapper.CarMapper;
import com.hasandel01.meetmeoutserver.user.model.Car;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.CarRepository;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import com.hasandel01.meetmeoutserver.user.service.CarService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final UserRepository userRepository;
    private final CarRepository carRepository;

    @Transactional
    public Set<CarDTO> getUsersCar(long userId) {

        User user  = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getCars().stream().map(CarMapper::toCarDTO).collect(Collectors.toSet());
    }

    @Transactional
    public CarDTO addCarToUser(long userId, CarDTO carDTO) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Car newCar = Car.builder()
                .make(carDTO.make())
                .model(carDTO.model())
                .year(carDTO.year())
                .owner(user)
                .capacity(carDTO.capacity())
                .build();

        user.getCars().add(newCar);
        Car savedCar = carRepository.save(newCar);

        return CarMapper.toCarDTO(savedCar);
    }

    @Transactional
    public Boolean deleteCarFromUser(long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));


        boolean isAssignedToOngoingApprovedEvent = car.getEventCars().stream()
                .filter(EventCar::isApproved)
                .anyMatch(ec -> !"ENDED".equals(ec.getEvent().getStatus()));

        if (isAssignedToOngoingApprovedEvent) {
            throw new RuntimeException("This car is assigned to an event and cannot be deleted.");
        }

        User owner = car.getOwner();
        if (owner != null) {
            owner.getCars().remove(car);
            userRepository.save(owner);
            carRepository.delete(car);
        }
        return true;
    }


    @Override
    public Void updateCar(long userId, CarDTO carDTO) {
        return null;
    }

    @Transactional
    public Boolean deletePermission(long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        return car.getEventCars().stream()
                .filter(EventCar::isApproved)
                .anyMatch(ec -> !"ENDED".equals(ec.getEvent().getStatus()));


    }
}
