package com.hasandel01.meetmeoutserver.search;


import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.event.mapper.EventMapper;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserRepository userRepository;

    private final EventRepository eventRepository;


    @GetMapping
    @Transactional
    public GlobalSearchResponse search(@RequestParam("query") String query, Pageable pageable) {

        Set<EventDTO> events = eventRepository.findByTitleContainingIgnoreCase(query, pageable)
                .stream()
                .map(EventMapper::toEventDto)
                .collect(Collectors.toSet());

        Set<UserDTO> users = userRepository
                .findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase
                        (query, query, query, pageable)
                .stream()
                .map(UserMapper::toUserDTO)
                .collect(Collectors.toSet());

        Set<EventDTO> eventsByTag = eventRepository.findByTags(query, pageable)
                .orElse(Collections.emptyList())
                .stream()
                .map(EventMapper::toEventDto)
                .collect(Collectors.toSet());

        Set<EventDTO> eventsByCategory = eventRepository.findByCategory(query, pageable)
                .orElse(Collections.emptyList())
                .stream()
                .map(EventMapper::toEventDto)
                .collect(Collectors.toSet());


        events.addAll(eventsByTag);
        events.addAll(eventsByCategory);

        return new GlobalSearchResponse(events, users);
    }

}
