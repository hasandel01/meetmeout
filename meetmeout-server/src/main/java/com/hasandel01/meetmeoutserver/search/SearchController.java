package com.hasandel01.meetmeoutserver.search;

import com.hasandel01.meetmeoutserver.companion.dto.FriendRequestDTO;
import com.hasandel01.meetmeoutserver.companion.repository.FriendRequestRepository;
import com.hasandel01.meetmeoutserver.companion.service.CompanionService;
import com.hasandel01.meetmeoutserver.event.dto.EventDTO;
import com.hasandel01.meetmeoutserver.user.dto.UserDTO;
import com.hasandel01.meetmeoutserver.event.mapper.EventMapper;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserRepository userRepository;

    private final EventRepository eventRepository;

    private final FriendRequestRepository friendRequestRepository;
    private final CompanionService companionService;


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

    @GetMapping("/companions")
    @Transactional
    public Set<UserDTO> searchCompanions(@RequestParam("query") String query, Pageable pageable) {

        Set<UserDTO> userDTOS =  userRepository.findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase
                (query, query, query, pageable)
                .stream()
                .map(UserMapper::toUserDTO)
                .collect(Collectors.toSet());

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Set<UserDTO> companions = friendRequestRepository.findAcceptedFriends(user.getId()).stream()
                .map(UserMapper::toUserDTO)
                .collect(Collectors.toSet());

        return userDTOS.stream().filter(companions::contains).collect(Collectors.toSet());
    }


    @GetMapping("/requesters")
    @Transactional
    public Set<UserDTO> searchRequesters(@RequestParam("query") String query, Pageable pageable) {

        Set<UserDTO> searchResults =  userRepository
                .findByUsernameContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase
                        (query, query, query, pageable)
                .stream()
                .map(UserMapper::toUserDTO)
                .collect(Collectors.toSet());

        List<FriendRequestDTO> friendRequestDTOList = companionService.getPendingFriendRequests();

        return friendRequestDTOList.stream().map(FriendRequestDTO::sender)
                .filter(searchResults::contains).collect(Collectors.toSet());
    }

}
