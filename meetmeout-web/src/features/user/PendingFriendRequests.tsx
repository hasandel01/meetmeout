import React, { use, useEffect, useState } from "react";
import axiosInstance from "../../axios/axios";
import {FriendRequest} from "../../types/FriendRequest";

const PendingFriendRequests = () => {
    
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

    const getPendingRequests = async () => {
        try {
            const response = await axiosInstance.get(`/get-pending-requests`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log("Pending friend requests fetched successfully:", response.data);
            setFriendRequests(response.data);
        } catch (error) {
            console.error("Error fetching pending friend requests:", error);
        }
    };


    useEffect(() => {
        getPendingRequests();
    }
    , []);


    const handleAcceptRequest = async (senderEmail: string) => {
        try {
            const response = await axiosInstance.post(`/accept-companion-request/${senderEmail}`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log("Companion request accepted:", response.data);
            setFriendRequests((prevRequests) => prevRequests.filter((request) => request.sender.email !== senderEmail));
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    }

    const handleRejectRequest = async (senderEmail: string) => {
        try {
            const response = await axiosInstance.post(`/reject-companion-request/${senderEmail}`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log("Companion request rejected:", response.data);
            setFriendRequests((prevRequests) => prevRequests.filter((request) =>  request.sender.email !== senderEmail));
        }
        catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    }

    return (
        <div className="pending-friend-requests">
            <h2>Pending Friend Requests</h2>
            <ul className="friend-requests-list">
                {friendRequests
                .filter((request) => request.status === "PENDING")
                .map((request) => (
                    <li key={request.id} className="friend-request-item">
                        <img src={request.sender.profilePictureUrl} alt="User" className="user-picture" />
                        <div className="user-details">
                            <h4>{request.sender.firstName} {request.sender.lastName}</h4>
                            <p>{request.sender.email}</p>
                            <button className="accept-button" onClick={() => handleAcceptRequest(request.sender.email)}>Accept</button>
                            <button className="decline-button" onClick={() => handleRejectRequest(request.sender.email)}>Decline</button>
                        </div>
                    </li>
                ))}
            </ul>
            {friendRequests.length === 0 && <p>No pending friend requests.</p>}
        </div>
    )


}

export default PendingFriendRequests;