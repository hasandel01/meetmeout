package com.hasandel01.meetmeoutserver.repository;

import com.hasandel01.meetmeoutserver.models.FriendRequest;
import com.hasandel01.meetmeoutserver.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
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

    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    Optional<List<FriendRequest>> findByReceiverAndStatus(User receiver, FriendRequest.Status status);
}
