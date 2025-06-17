package com.hasandel01.meetmeoutserver.event.service;


import com.hasandel01.meetmeoutserver.event.dto.EventCarDTO;
import com.hasandel01.meetmeoutserver.user.dto.CarDTO;

import java.util.List;

public interface EventCarService {

    List<EventCarDTO> addCarsToEvent(long eventId, List<CarDTO> cars);

    List<EventCarDTO> getAllTheCarsForTheEvent(long evenId);

    Boolean addPassengers(long eventCarId, List<Long> ids);

    Boolean deleteEventCar(long eventCarId);

    Boolean requestCarsToEvent(long eventId, List<CarDTO> cars);

    void approveEventCar(long eventCarId);
}
