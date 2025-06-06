package com.hasandel01.meetmeoutserver.user.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    private String title;

    private String description;

    private String iconUrl;

    @ManyToMany(mappedBy = "badges", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> holders = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;
}
