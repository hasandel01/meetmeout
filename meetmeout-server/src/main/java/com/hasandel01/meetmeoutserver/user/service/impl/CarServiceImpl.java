package com.hasandel01.meetmeoutserver.user.service.impl;


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
        userRepository.save(user);

        return CarMapper.toCarDTO(newCar);
    }

    @Transactional
    public Void deleteCarFromUser(long userId) {

        //TODO

        return null;
    }

    @Override
    public Void updateCar(long userId, CarDTO carDTO) {
        return null;
    }
}
