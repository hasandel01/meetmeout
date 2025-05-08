package com.hasandel01.meetmeoutserver.event.mapper;

import com.hasandel01.meetmeoutserver.event.dto.CommentDTO;
import com.hasandel01.meetmeoutserver.event.model.Comment;
import com.hasandel01.meetmeoutserver.user.mapper.UserMapper;

public class CommentMapper {

    public static CommentDTO toCommentDTO(Comment comment) {
        return CommentDTO.builder()
                .comment(comment.getComment())
                .commentId(comment.getId())
                .sender(UserMapper.toUserDTO(comment.getSender()))
                .updatedAt(comment.getUpdatedAt())
                .eventId(comment.getEvent().getId())
                .build();
    }
}
