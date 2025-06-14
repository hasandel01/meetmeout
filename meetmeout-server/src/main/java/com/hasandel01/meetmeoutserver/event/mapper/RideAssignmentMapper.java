package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.RideAssignmentDTO;
import com.hasandel01.meetmeoutserver.event.model.RideAssignment;
import com.hasandel01.meetmeoutserver.user.mapper.CarMapper;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

public class RideAssignmentMapper {

    public static RideAssignmentDTO toRideAssignmentDTO(RideAssignment rideAssignment) {
        return RideAssignmentDTO
                .builder()
                .id(rideAssignment.getId())
                .passenger(UserMapper.toUserDTO(rideAssignment.getPassenger()))
                .build();
    }

}
