package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.CommentDTO;
import com.hasandel01.meetmeoutserver.event.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comment")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{eventId}")
    public ResponseEntity<CommentDTO> addComment(@Valid @PathVariable long eventId, @RequestBody CommentDTO comment) {
            return ResponseEntity.ok(commentService.addComment(eventId, comment));
    }


    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable long commentId) {
            return ResponseEntity.ok(commentService.deleteComment(commentId));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Void> updateComment(@PathVariable long commentId, @RequestBody CommentDTO comment) {
            return ResponseEntity.ok(commentService.updateComment(commentId, comment));
    }
}
