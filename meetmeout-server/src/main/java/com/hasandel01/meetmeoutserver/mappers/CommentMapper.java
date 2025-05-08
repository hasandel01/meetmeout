package com.hasandel01.meetmeoutserver.mappers;

import com.hasandel01.meetmeoutserver.dto.CommentDTO;
import com.hasandel01.meetmeoutserver.event.Comment;

public class CommentMapper {

    public static CommentDTO toCommentDTO(Comment comment) {
        return CommentDTO.builder()
                .comment(comment.getComment())
                .commentId(comment.getId())
                .username(comment.getSender().getUsername())
                .updatedAt(comment.getUpdatedAt())
                .userId(comment.getSender().getId())
                .eventId(comment.getEvent().getId())
                .build();
    }
}
