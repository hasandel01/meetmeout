package com.hasandel01.meetmeoutws;


import com.hasandel01.meetmeoutws.user.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    @Query("""
          SELECT friend.receiver FROM FriendRequest friend
          WHERE friend.sender.id = :userId AND friend.status = 'ACCEPTED'
          UNION 
          SELECT friend.sender FROM FriendRequest friend
          WHERE friend.receiver.id = :userId and friend.status = 'ACCEPTED'
          """)
    Set<User> findAcceptedFriends(@Param("userId") Long userId);
}
