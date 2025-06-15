package com.hasandel01.meetmeoutserver.user.service;

import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.model.Car;

import java.util.Set;

public interface CarService {

    Set<CarDTO> getUsersCar(long userId);

    CarDTO addCarToUser(long userId, CarDTO carDTO);

    Void deleteCarFromUser(long userId);

    Void updateCar(long userId, CarDTO carDTO);
}
