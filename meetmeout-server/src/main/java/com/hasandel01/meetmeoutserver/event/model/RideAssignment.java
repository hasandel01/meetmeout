package com.hasandel01.meetmeoutserver.event.model;

import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RideAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User passenger;

    @ManyToOne
    @JoinColumn(name = "event_car_id")
    private EventCar eventCar;
}

