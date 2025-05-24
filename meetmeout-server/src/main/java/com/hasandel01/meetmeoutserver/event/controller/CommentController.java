package com.hasandel01.meetmeoutserver.event.controller;


import com.hasandel01.meetmeoutserver.event.dto.CommentDTO;
import com.hasandel01.meetmeoutserver.event.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/add-comment/{eventId}")
    public ResponseEntity<CommentDTO> addComment(@Valid @PathVariable long eventId, @RequestBody CommentDTO comment) {
        try {
            return ResponseEntity.ok(commentService.addComment(eventId, comment));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @DeleteMapping("/delete-comment/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable long commentId) {
        try {
            return ResponseEntity.ok(commentService.deleteComment(commentId));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/update-comment/{commentId}")
    public ResponseEntity<Void> updateComment(@PathVariable long commentId, @RequestBody CommentDTO comment) {
        try {
            return ResponseEntity.ok(commentService.updateComment(commentId, comment));
        }catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
