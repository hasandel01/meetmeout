package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/tags")
@RequiredArgsConstructor
@RestController
public class TagsController {

    private final EventService eventService;

    @GetMapping("/recommended")
    public ResponseEntity<List<String>> recommendedTags() {
        return ResponseEntity.ok(eventService.getRecommendedTags());
    }

}
