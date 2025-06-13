package com.hasandel01.meetmeoutserver.user.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class TravelAssociateDTO {
    private UserDTO user;
    private int number;
}
