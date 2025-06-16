package com.hasandel01.meetmeoutserver.user.model;


import com.hasandel01.meetmeoutserver.event.model.EventCar;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Year;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Size(min = 2, max = 20)
    private String make;

    @Size(min = 2, max = 20)
    private String model;

    @Min(1900)
    private int year;

    @Min(2)
    @Max(25)
    private int capacity;

    @ManyToOne
    private User owner;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<EventCar> eventCars = new HashSet<>();

}

