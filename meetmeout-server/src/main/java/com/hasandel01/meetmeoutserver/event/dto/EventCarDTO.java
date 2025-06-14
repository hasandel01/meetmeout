package com.hasandel01.meetmeoutserver.event.dto;

import com.hasandel01.meetmeoutserver.user.dto.CarDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class EventCarDTO {
    private Long id;
    private CarDTO car;
    private List<UserDTO> passengers;
}
