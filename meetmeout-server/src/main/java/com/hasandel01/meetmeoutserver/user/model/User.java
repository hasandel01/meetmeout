package com.hasandel01.meetmeoutserver.user.model;


import com.hasandel01.meetmeoutserver.event.model.Comment;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.model.Like;
import com.hasandel01.meetmeoutserver.event.model.Review;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Table(name = "app_user")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Size(min = 2, max = 50)
    private String firstName;

    @Size(min = 2, max = 50)
    private String lastName;

    @Size(min = 3, max = 30)
    @Column(unique = true, nullable = false)
    private String username;

    @Size(max = 100)
    @Column(unique = true)
    private String email;

    @Size(min = 8, max = 100)
    @Column(nullable = false)
    private String password;

    @Size(min = 10, max = 15)
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

    @ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name="user_badges",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "badge_id")
    )
    private Set<Badge> badges = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    private Boolean emailVerified = false;

    private String verificationToken;

    private String resetPasswordToken;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Like> likes = new HashSet<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "reviewer", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Review> reviews = new HashSet<>();

    @Column(nullable = false)
    private Boolean showLocation = false;

    @Column(nullable = false)
    private Boolean darkMode = false;

    @OneToMany(mappedBy = "reviewer", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<UserReview> userReviews = new HashSet<>();

    @OneToMany(mappedBy =  "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<UserReview> receivedUserReviews = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column
    private LocalDateTime deletedAt;
}
