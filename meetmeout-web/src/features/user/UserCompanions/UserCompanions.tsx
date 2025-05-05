import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import {User} from "../../../types/User";
import { useEffect, useState } from "react";
import styles from "./UserCompanions.module.css";
import AddCompanion from "./AddCompanion";
import PendingFriendRequests from "./PendingFriendRequests";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserCompanions = () => {

    const { username } = useParams<{ username: string }>();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [companions, setCompanions] = useState<User[]>([]);
    const [requestSentUsers, setRequestSentUsers] = useState<User[]>([]);
    const navigate = useNavigate();

        const goToUserProfile = (username: string) => {
            try {
                navigate(`/user-profile/${username}`);
            }
            catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        const getRequestSentUsers = async () => {
            try {
                const response = await axiosInstance.get(`/get-request-sent-users`);
                setRequestSentUsers(response.data);
            }catch(error) {

            }
        }

        const getCompanions = async () => {
            try {
                const response = await axiosInstance.get(`/${username}/companions`);
                console.log("Companion profile fetched successfully:", response.data);
                setCompanions(response.data );
            }
            catch (error) {
                console.error("Error fetching companion profile:", error);
            }
        };

        const getMe = async () => {
            try {
                const response = await axiosInstance.get(`/me`);
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
            getRequestSentUsers()
        }, []);


        const removeCompanion = async (companionEmail: string) => {

            try {
                const response = await axiosInstance.post(`/remove-companion/${companionEmail}`)
                if(response.data === true)
                    toast.success("Companion removed!")
                
                setCompanions((prev) => prev.filter((companion) => companion.email !== companionEmail))
            }catch(error) {
                toast.error("There was an error while removing companion...");
            }
        }


        const cancelRequest = async (companionEmail: string) => {
            try {
                const response = await axiosInstance.delete(`/cancel-companion-request/${companionEmail}`);
                console.log(response.data)
            } catch(error) {

            }
        } 



    return (
        <div className ={styles.container}>
            {requestSentUsers.length > 0 && (
                <div className={styles.containerAlt}>
                    <h3>{requestSentUsers.length > 0 ? "Sent Requests" : ""}</h3>
                    <div className={styles.divisionContainer}>
                        <ul>
                        {requestSentUsers.map((user) => (
                            <li key={user.id} onClick={() => goToUserProfile(user.username)}>
                            <div className={styles.userDetails}>
                                <img src={user.profilePictureUrl} alt="User" />
                                <div className={styles.userDetailsInfo}>
                                    <h4>{user.firstName} {user.lastName}</h4>
                                    <p>@{user.username}</p>
                                </div>
                            </div>
                            <button className={styles.decline}
                                onClick={(e) => {
                                e.stopPropagation();
                                cancelRequest(user.email);
                                
                                }}
                            >
                                Cancel
                            </button>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
                )}
            {currentUser?.username === username && (
             <>
            <PendingFriendRequests></PendingFriendRequests>  
            </> 
            )}
 
            <div className={styles.containerAlt}>  
            <h3>{companions.length > 0 ? "Companions" : ""}</h3>
                <div className={styles.divisionContainer}>
                        <ul>
                            {companions.map((companion: User) => (
                                <li key={companion.email} onClick={() => goToUserProfile(companion.username)}>
                                    <div className={styles.userDetails}>
                                        <img src={companion.profilePictureUrl} alt="Companion" />
                                        <div className={styles.userDetailsInfo}>
                                            <h4>{companion.firstName} {companion.lastName}</h4>
                                            <p>{companion.username}</p>
                                        </div>
                                    </div>
                                    <button 
                                            className={styles.decline}
                                            onClick={(e) =>
                                        {
                                            e.stopPropagation();
                                            removeCompanion(companion.email)
                                        }
                                    }>
                                        Remove
                                    </button>
                                </li>
                            ))}
                    </ul>      
                </div>
            </div>
            {currentUser?.username === username && (
             <>            
            <AddCompanion></AddCompanion>
            </> 
            )}
        </div>
    )


}

export default UserCompanions;