package com.hasandel01.meetmeoutserver.user.mapper;


import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.model.Car;
import com.hasandel01.meetmeoutserver.user.model.User;


public class CarMapper {

    public static CarDTO toCarDTO(Car car) {

        return CarDTO.builder()
                .id(car.getId())
                .make(car.getMake())
                .model(car.getModel())
                .year(car.getYear())
                .userId(car.getOwner().getId())
                .capacity(car.getCapacity())
                .build();
    }

    public static Car toCar(CarDTO carDTO, User user) {

        return Car.builder()
                .make(carDTO.make())
                .model(carDTO.model())
                .year(carDTO.year())
                .owner(user)
                .capacity(carDTO.capacity())
                .build();
    }

}
