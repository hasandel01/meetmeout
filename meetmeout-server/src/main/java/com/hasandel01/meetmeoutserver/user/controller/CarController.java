package com.hasandel01.meetmeoutserver.user.controller;


import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.model.Car;
import com.hasandel01.meetmeoutserver.user.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @GetMapping("/{userId}")
    public ResponseEntity<Set<CarDTO>> getCar(@PathVariable("userId") long userId) {
        return ResponseEntity.ok(carService.getUsersCar(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<CarDTO> addCar(@PathVariable("userId") long userId,
                                         @RequestBody CarDTO carDTO) {
        return ResponseEntity.ok(carService.addCarToUser(userId,carDTO));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteCar(@PathVariable("userId") long userId) {
        return ResponseEntity.ok(carService.deleteCarFromUser(userId));
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<Void> updateCar(@PathVariable("userId") long userId,
                                          @RequestBody CarDTO carDTO) {
        return ResponseEntity.ok(carService.updateCar(userId,carDTO));
    }

}
