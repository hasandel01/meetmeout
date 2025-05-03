import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import {User} from "../../../types/User";
import { useEffect, useState } from "react";
import styles from "./UserCompanions.module.css";
import AddCompanion from "../AddCompanion";
import PendingFriendRequests from "../PendingFriendRequests";

const UserCompanions = () => {

    const { username } = useParams<{ username: string }>();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [companions, setCompanions] = useState<User[]>([]);
    const navigate = useNavigate();

        const goToUserProfile = async (username: string) => {
            try {
                navigate(`/user-profile/${username}`);
            }
            catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

    
        const getCompanions = async () => {
            try {
                const response = await axiosInstance.get(`/${username}/companions`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
            
                console.log("Companion profile fetched successfully:", response.data);
                setCompanions(response.data );
            }
            catch (error) {
                console.error("Error fetching companion profile:", error);
            }
        };

        const getMe = async () => {
            try {
                const response = await axiosInstance.get(`/me`, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
            
                console.log("Current user fetched successfully:", response.data);
                setCurrentUser(response.data);
            }
            catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        useEffect(() => {
            getCompanions();
            getMe();
        }, []);


    return (
        <div className ={styles.container}>
            {currentUser?.username === username &&(
             <>
            <AddCompanion></AddCompanion>
            <PendingFriendRequests></PendingFriendRequests>
            </> 
            )}
            <h2>Companions</h2>
            {companions.length === 0 && <p>No companions found.</p>}
                    <ul className="companions-list">
                        {companions.map((companion: User) => (
                            <li key={companion.email} className="companion-item" onClick={() => goToUserProfile(companion.username)}>
                                <img src={companion.profilePictureUrl} alt="Companion" className="companion-picture" />
                                <div className="companion-details">
                                    <h4>{companion.firstName} {companion.lastName}</h4>
                                    <p>{companion.bio}</p>
                                    <p>Email: {companion.email}</p>
                                    <p>Phone: {companion.phone}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                                    
        </div>
    )


}

export default UserCompanions;