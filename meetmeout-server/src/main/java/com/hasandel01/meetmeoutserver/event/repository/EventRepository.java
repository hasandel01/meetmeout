package com.hasandel01.meetmeoutserver.event.repository;

import com.hasandel01.meetmeoutserver.enums.Categories;
import com.hasandel01.meetmeoutserver.enums.EventStatus;
import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.user.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByTitleContainingIgnoreCase(String query, Pageable pageable);

    List<Event> findByStatus(EventStatus status);

    @Query("""
        SELECT event FROM Event event
        JOIN event.tags t
        WHERE LOWER(t) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    Optional<List<Event>> findByTags(@Param("query") String query, Pageable pageable);


    @Query("""
        SELECT event FROM Event event
        WHERE LOWER(event.category) LIKE LOWER(CONCAT('%', :query, '%'))
    
    """)
    Optional<List<Event>> findByCategory(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT DISTINCT tag " +
            "FROM event_tags " +
            "WHERE LOWER(tag) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY tag", nativeQuery = true)
    List<String> findAllDistinctTags(@Param("query") String query, Pageable pageable);


    @Query("""
    SELECT ev FROM Event ev WHERE ev.status='ONGOING' OR ev.status='FULL'
    """)
    List<Event> findOngoingAndFullEvents();
}
