import { useEffect, useState } from "react";
import axiosInstance from "../../../axios/axios";
import {FriendRequest} from "../../../types/FriendRequest";
import styles from "./UserCompanions.module.css" 
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PendingFriendRequests = () => {
    
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const navigate = useNavigate();

    const getPendingRequests = async () => {
        try {
            const response = await axiosInstance.get(`/get-pending-requests`);
            setFriendRequests(response.data);
        } catch (error) {
        }
    };


    useEffect(() => {
        getPendingRequests();
    }
    , []);


    const goToUserProfile = (username: string) => {
        try {
            navigate(`/user-profile/${username}`);
        }
        catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };


    const handleAcceptRequest = async (senderEmail: string) => {
        try {
            await axiosInstance.post(`/accept-companion-request/${senderEmail}`, null);
            toast.info("Companion request is accepted.")
            setFriendRequests((prevRequests) => prevRequests.filter((request) => request.sender.email !== senderEmail));
        } catch (error) {
            toast.error("Error happened while accepting companion request.")
        }
    }

    const handleRejectRequest = async (senderEmail: string) => {
        try {
            const response = await axiosInstance.post(`/reject-companion-request/${senderEmail}`, null);
            console.log("Companion request rejected:", response.data);
            setFriendRequests((prevRequests) => prevRequests.filter((request) =>  request.sender.email !== senderEmail));
        }
        catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    }

    return (
        <div className={styles.containerAlt}>
            <h3>{friendRequests.length > 0 ? "Pending Friend Requests" : ""}</h3>
                <div className={styles.divisionContainer}>
                    <ul>
                        {friendRequests
                        .map((request) => (
                                <li key={request.id} className="friend-request-item" onClick={() => goToUserProfile(request.sender.username)}>
                                <div className={styles.userDetails}>
                                    <img src={request.sender.profilePictureUrl} alt="User" className="user-picture" />
                                    <div className={styles.userDetailsInfo}>
                                        <h4>{request.sender.firstName} {request.sender.lastName}</h4>
                                        <p>@{request.sender.username}</p>
                                    </div>
                                </div>
                                <div className={styles.actionButtons}>
                                <button 
                                    className={`${styles.button} ${styles.accept}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcceptRequest(request.sender.email);
                                    }}>
                                        Accept</button>
                                <button 
                                    className={`${styles.button} ${styles.decline}`}
                                    onClick={(e) =>
                                    {
                                        e.stopPropagation(); 
                                        handleRejectRequest(request.sender.email)
                                    }}>Decline</button>
                                </div>
                                </li>
                        ))}
                    </ul>
                </div>
        </div>
    )


}

export default PendingFriendRequests;