package com.hasandel01.meetmeoutserver.user.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@Entity
public class UserReview {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String review;

    @Max(5)
    @Min(1)
    private int rating;

    @ManyToOne
    private User user;

    @ManyToOne(cascade = CascadeType.ALL)
    private User reviewer;

    @CreatedDate
    private LocalDateTime createdAt;
}
