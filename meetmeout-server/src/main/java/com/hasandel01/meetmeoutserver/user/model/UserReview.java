package com.hasandel01.meetmeoutserver.user.model;


import com.hasandel01.meetmeoutserver.event.model.Event;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserReview {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Length(min = 1, max = 300)
    private String review;

    @Max(5)
    @Min(1)
    private int rating;

    @ManyToOne
    private User user;

    @ManyToOne(cascade = CascadeType.ALL)
    private User reviewer;

    @ManyToOne(cascade = CascadeType.ALL)
    private Event event;

    @CreatedDate
    private LocalDateTime createdAt;
}
