import { useEffect } from "react";
import axiosInstance from "../../../axios/axios";
import { User } from "../../../types/User";
import { useState } from "react";
import styles from "./UserCompanions.module.css" 
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddCompanion = () => {

    const [users, setUsers] = useState<User[] | null>(null);
    const navigate = useNavigate();

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(`/get-possible-friends`);
            setUsers(response.data);
        } catch (error) {
        }
    };


    const handleAddCompanion = async (receiverEmail: string) => {
        try {
            await axiosInstance.post(`/add-a-companion/${encodeURIComponent(receiverEmail)}`,
                null);
            
            toast.info("Companion request sent!");

            setUsers((prev) => (prev ?? []).filter((user) => user.email !== receiverEmail))
        }
        catch (error) {
            toast.error("Error sending companion request.")
        }
    }


    useEffect(() => {
        getAllUsers();
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

    return (
        <div className={styles.containerAlt}>
            <h3>{users && users.length > 0 ? "Suggestions" : ""}</h3>
            <div className={styles.divisionContainer}>
                <ul>
                {users?.map((user) => (
                        <li key={user.id} onClick={() => goToUserProfile(user.username)}>
                            <div className={styles.userDetails}>
                                <img src={user.profilePictureUrl} alt="User" className="user-picture" />
                                <div className={styles.userDetailsInfo}>
                                    <h4>{user.firstName} {user.lastName}</h4>
                                    <p>@{user.username}</p>
                                </div>
                            </div>
                            <button className={`${styles.addButton}`} 
                                onClick={(e) =>{
                                e.stopPropagation();
                                handleAddCompanion(user.email);
                            }}>Send Companion Request</button>
                        </li>
                    ))}
                </ul>
            </div>
    </div> 
    )
}

export default AddCompanion;