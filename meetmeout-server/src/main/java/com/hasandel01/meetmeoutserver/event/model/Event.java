package com.hasandel01.meetmeoutserver.event.model;

import com.hasandel01.meetmeoutserver.enums.Categories;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Enumerated(EnumType.STRING)
    private Categories category;

    @ElementCollection
    @CollectionTable(name = "event_tags", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "tag")
    private Set<String> tags;

    private String imageUrl;

    private boolean isThereRoute;

    private double latitude;
    private double longitude;
    private String addressName;

    private double endLatitude;
    private double endLongitude;
    private String endAddressName;

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

    private boolean isCapacityRequired;
    private int maximumCapacity;

    private boolean isFeeRequired;
    private double fee;

    @Length(max = 400)
    private String feeDescription;

    private boolean isPrivate;
    private boolean isDraft;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "event",  cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Like> likes = new HashSet<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Review> reviews = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private Set<String> eventPhotoUrls = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private RouteType routeType;

}
