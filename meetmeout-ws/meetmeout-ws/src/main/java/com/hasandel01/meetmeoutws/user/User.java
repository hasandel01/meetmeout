package com.hasandel01.meetmeoutws.user;

import com.hasandel01.meetmeoutws.event.Event;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;

import java.util.HashSet;
import java.util.Set;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Table(name = "app_user")
public class User   {

    @Id
    private Long id;

    private String username;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;

    private String phone;

    private String profilePictureUrl;

    @Length(max = 400)
    private String about;

    @Transient
    private Set<User> companions = new HashSet<>();

    @ManyToMany(mappedBy = "attendees", cascade = { CascadeType.PERSIST, CascadeType.MERGE } )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Event> participatedEvents = new HashSet<>();

    @OneToMany(mappedBy = "organizer", cascade = { CascadeType.PERSIST, CascadeType.MERGE } )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Event> organizedEvents = new HashSet<>();


    @Column(nullable = false)
    private Boolean showLocation = false;

    @Column(nullable = false)
    private Boolean darkMode = false;



}