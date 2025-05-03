import { useEffect, useState } from "react";
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import styles from "./UserProfile.module.css";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";

const UserProfile = () => {

    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const getUserProfile = async () => {
        try {
            const response = await axiosInstance.get(`/${username}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUser(response.data);
            getCompanions();
            console.log("User profile fetched successfully:", response.data);
    }   catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };


    const getMe = async () => {
        try {
            const response = await axiosInstance.get(`/me`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setCurrentUser(response.data);
            console.log("Current user fetched successfully:", response.data);
        }
        catch (error) {
            console.error("Error fetching current user:", error);
        }
    }

    const getCompanions = async () => {
        try {
            const response = await axiosInstance.get(`/${username}/companions`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setUser((prevUser) => {
                if (!prevUser) return null; 
                return {
                    ...prevUser,
                    companions: response.data,
                };
            });
            console.log("Companions fetched successfully:", response.data);
        }catch (error) {
            console.error("Error fetching companions:", error);
        }
    };


    useEffect(() => {
        getUserProfile();
        getMe();
    }, []);


    const updateProfilePicture = async () => {
        try {
            const formData = new FormData();
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = async (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                    formData.append("profilePicture", file);
                    try {
                        const response = await axiosInstance.post("/update/profile-picture", formData, {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        });
                        
                        console.log("Profile picture updated successfully:", response.data);
                        getUserProfile();
                    } catch (error) {
                        console.error("Error updating profile picture:", error);
                    }
                }
            }
            fileInput.click();  
        }
        catch (error) {
            console.error("Error creating file input:", error);
        }
    };

    return (
        <div className={styles.userProfile}>
            <div className={styles.userProfileHeader}>
                <div className={styles.userProfileDetails}>
                    <div className={styles.userProfilePictureContainer}>
                        <div className={styles.profilePicture}>
                            <img  src={user?.profilePictureUrl} alt= "User Profile" />
                            {currentUser && currentUser.username === username && (
                                <div className={styles.cameraOverlay} onClick={updateProfilePicture} > <FontAwesomeIcon icon={faCamera} size="2x" /></div>
                            )}
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        <h3>{user?.firstName} {user?.lastName}</h3>
                    </div>
                    </div>
                    <h3>About </h3> 
                    <p> {user?.bio}</p>
                    <p>Email: {user?.email}</p>
                    <p>Phone: {user?.phone}</p>
                    <a href={`/${user?.username}/companions`} className={styles.companionsList}>{user?.companions.length} Companions</a>
                </div>
                <div className="user-badges">
                </div>
        </div>
    );
}


export default UserProfile;