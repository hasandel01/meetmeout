package com.hasandel01.meetmeoutserver.event.service.impl;


import com.hasandel01.meetmeoutserver.event.dto.CommentDTO;
import com.hasandel01.meetmeoutserver.event.mapper.CommentMapper;
import com.hasandel01.meetmeoutserver.event.model.Comment;
import com.hasandel01.meetmeoutserver.event.model.Event;
import com.hasandel01.meetmeoutserver.event.repository.CommentRepository;
import com.hasandel01.meetmeoutserver.event.repository.EventRepository;
import com.hasandel01.meetmeoutserver.event.service.CommentService;
import com.hasandel01.meetmeoutserver.user.model.User;
import com.hasandel01.meetmeoutserver.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Transactional
    public Void updateComment(long commentId, CommentDTO comment) {

        Comment comment1 = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment1.setComment(comment.comment());
        comment1.setUpdatedAt(LocalDateTime.now());

        commentRepository.save(comment1);

        return null;

    }

    @Transactional
    public CommentDTO addComment(@Valid long eventId, CommentDTO commentDTO) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if(commentDTO.comment().isEmpty())
            throw new RuntimeException("Comment is empty");

        Comment comment = Comment.builder()
                .event(event)
                .sender(user)
                .comment(commentDTO.comment())
                .sentAt(LocalDateTime.now(ZoneId.of("Europe/Istanbul")))
                .updatedAt(LocalDateTime.now(ZoneId.of("Europe/Istanbul")))
                .build();

        commentRepository.save(comment);

        return CommentMapper.toCommentDTO(comment);
    }

    @Transactional
    public Void deleteComment(long commentId) {

        Optional<Comment> comment = commentRepository.findById(commentId);

        comment.ifPresent(commentRepository::delete);

        return null;
    }
}
