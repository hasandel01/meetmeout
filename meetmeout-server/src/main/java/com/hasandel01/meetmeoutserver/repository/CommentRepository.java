package com.hasandel01.meetmeoutserver.repository;

import com.hasandel01.meetmeoutserver.event.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

}
