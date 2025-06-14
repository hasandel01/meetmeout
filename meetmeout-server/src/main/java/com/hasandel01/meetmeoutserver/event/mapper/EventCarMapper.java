package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.EventCarDTO;
import com.hasandel01.meetmeoutserver.event.model.EventCar;
import com.hasandel01.meetmeoutserver.user.mapper.CarMapper;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

import java.util.List;
import java.util.stream.Collectors;

public class EventCarMapper {

    public static EventCarDTO toEventCarDTO(EventCar eventCar) {
        return EventCarDTO.builder()
                .id(eventCar.getId())
                .car(CarMapper.toCarDTO(eventCar.getCar()))
                .passengers(eventCar.getRideAssignments().stream()
                        .map(ride -> UserMapper.toUserDTO(ride.getPassenger()))
                        .collect(Collectors.toList()))
                .build();
    }

    public static List<EventCarDTO> toEventCarDTOList(List<EventCar> eventCars) {
        return eventCars.stream()
                .map(EventCarMapper::toEventCarDTO)
                .collect(Collectors.toList());
    }
}
