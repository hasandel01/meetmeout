package com.hasandel01.meetmeoutserver.event.dto;


import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;

@Builder
public record RideAssignmentDTO(
        Long id,
        CarDTO car,
        UserDTO passenger
) {
}
