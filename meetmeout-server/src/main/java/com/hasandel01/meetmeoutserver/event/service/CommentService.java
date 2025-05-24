package com.hasandel01.meetmeoutserver.event.service;


import com.hasandel01.meetmeoutserver.event.dto.CommentDTO;
import jakarta.validation.Valid;

public interface CommentService {

    Void updateComment(long commentId, CommentDTO comment);

    CommentDTO addComment(@Valid long eventId, CommentDTO commentDTO);

    Void deleteComment(long commentId);

}
