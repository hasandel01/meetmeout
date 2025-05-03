package com.hasandel01.meetmeoutserver.models;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name= "app_like")
public class Like {

    @Id
    @GeneratedValue(strategy= GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Event event;

}
