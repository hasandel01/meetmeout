package com.hasandel01.meetmeoutserver.event.model;

import com.hasandel01.meetmeoutserver.user.model.Car;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "event_car")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Event event;

    @ManyToOne
    private Car car;

    @OneToMany(mappedBy = "eventCar", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<RideAssignment> rideAssignments = new HashSet<>();
}
