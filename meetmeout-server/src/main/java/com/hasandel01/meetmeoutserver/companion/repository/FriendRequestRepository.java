package com.hasandel01.meetmeoutserver.companion.repository;

import com.hasandel01.meetmeoutserver.companion.model.FriendRequest;
import com.hasandel01.meetmeoutserver.user.model.User;
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


    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    Optional<List<FriendRequest>> findByReceiverAndStatus(User receiver, FriendRequest.Status status);

    @Transactional
    @Modifying
    @Query("""
    DELETE FROM FriendRequest as fr
    WHERE (
        (fr.sender.id = :userId AND fr.receiver.id = :companionId)
        OR 
        (fr.sender.id = :companionId AND fr.receiver.id = :userId)
        )AND fr.status = 'ACCEPTED'
    """)
    void deleteAcceptedFriend(@Param("userId") Long userId,@Param("companionId") Long companionId);

    List<FriendRequest> findBySenderAndStatus(User sender, FriendRequest.Status status);



    @Transactional
    @Modifying
    @Query("""
    DELETE FROM FriendRequest as fr 
    WHERE fr.sender.id = :userId AND fr.receiver.id = :companionId
    """)
    void deleteFriendRequest(@Param("userId") Long userId,@Param("companionId") Long companionId);

    @Transactional
    @Modifying
    @Query("""
    SELECT fr FROM FriendRequest fr 
    WHERE fr.sender = :user OR fr.receiver = :user
    """)
    List<FriendRequest> findAllByUserInvolved(@Param("user") User user);

    Optional<FriendRequest> findBySenderAndReceiverOrReceiverAndSender(User sender, User receiver, User receiver1, User sender1);
}
