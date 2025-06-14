package com.hasandel01.meetmeoutserver.user.dto;


import lombok.Builder;

@Builder
public record CarDTO(
    Long id,
    String make,
    String model,
    int year,
    int capacity,
    Long userId
){
}
