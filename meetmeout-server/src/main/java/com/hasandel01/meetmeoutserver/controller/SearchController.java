package com.hasandel01.meetmeoutserver.controller;


import com.hasandel01.meetmeoutserver.dto.EventDTO;
import com.hasandel01.meetmeoutserver.dto.UserDTO;
import com.hasandel01.meetmeoutserver.mappers.EventMapper;
import com.hasandel01.meetmeoutserver.mappers.UserMapper;
import com.hasandel01.meetmeoutserver.models.GlobalSearchResponse;
import com.hasandel01.meetmeoutserver.repository.EventRepository;
import com.hasandel01.meetmeoutserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserRepository userRepository;

    private final EventRepository eventRepository;


    @GetMapping
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

        return new GlobalSearchResponse(events, users);
    }

}
