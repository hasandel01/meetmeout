package com.hasandel01.meetmeoutws.event;



import com.hasandel01.meetmeoutws.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy= GenerationType.SEQUENCE)
    private Long id;

    @Length(max = 50)
    private String title;

    @Length(max = 500)
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;


    @ManyToOne
    @JoinColumn(name = "organizer_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User organizer;

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "event_participants",
            joinColumns = @JoinColumn(name = "event_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> attendees = new HashSet<>();
}

