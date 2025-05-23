import { useEffect, useState } from "react";
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import styles from "./UserProfile.module.css";
import { faCamera, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import UserUpdateForm from "../UserUpdateForm/UserUpdateForm";
import { useUserContext } from "../../../context/UserContext";


const UserProfile = () => {

    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const { currentUser, getMe } = useUserContext();
    const [companions, setCompanions] = useState<User[]>([]);
    const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);

    const getUserProfile = async () => {
        try {
            const response = await axiosInstance.get(`/${username}`);
            setUser(response.data);
    }   catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

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

    useEffect(() => {
        getUserProfile();
        getCompanions();
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
                        const response = await axiosInstance.put("/me/profile-picture", formData,
                            {
                                headers: {
                                "Content-Type": "multipart/form-data"
                              }
                            }
                        );

                        setUser((prevUser) => {
                            if (!prevUser) return prevUser;
                            return {
                                ...prevUser,
                                profilePictureUrl: response.data.profilePictureUrl
                            };
                        });

                        await getMe();
                        getUserProfile();
                    } catch (error) {
                    }
                }
            }
            fileInput.click();  
        }
        catch (error) {
            console.error("Error creating file input:", error);
        }
    };


    const updateProfile = async () => {
        setShowUserUpdateForm(prev => !prev);
    }

    return (
        <div className={styles.userProfile}>
            {user && showUserUpdateForm && <UserUpdateForm currentUser={user} onClose={() => setShowUserUpdateForm((prev) => !prev)} />}
            <div className={styles.userProfileHeader}>
                <div className={styles.userProfileDetails}>
                    <FontAwesomeIcon 
                        icon={faPenToSquare} 
                        size="2x" 
                        className={styles.updateIcon}
                        onClick={updateProfile}
                        ></FontAwesomeIcon>
                    <div className={styles.userProfilePictureContainer}>
                        <div className={styles.profilePicture}>
                            <img  src={user?.profilePictureUrl} alt= "User Profile" />
                            {currentUser && currentUser.username === username && (
                                <span className={styles.cameraOverlay} onClick={updateProfilePicture} > <FontAwesomeIcon icon={faCamera} size="2x" /></span>
                            )}
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        <h3>{user?.firstName} {user?.lastName}</h3>
                        <h4>@{user?.username}</h4>
                        <p> {user?.about}</p>
                    </div>
                    <hr/>
                    <div className={styles.stats}>
                        <span>
                            <h4>{user?.participatedEventIds?.length}</h4>
                            <p>Participated Events</p>
                        </span>
                        <span>
                            <h4>{user?.organizedEventIds?.length}</h4>
                            <p>Created Events</p>
                        </span>
                        <span>
                            <h4>{companions.length}</h4>
                            <p> Companions</p>
                        </span>
                    </div>
                    </div>
                </div>
                <div className={styles.badgeContainer}>
                    <div>
                        <h4>Trophies</h4>                    
                        <ul>
                            {user?.badges
                            .map((badge, index) => {
                                return (
                                       <li key={index}>
                                            <img src={badge.iconUrl} alt="Badge Icon"></img>
                                            <h4>{badge.title}</h4>
                                            <p>{badge.description}</p>
                                        </li> 
                                )
                            })}
                        </ul>
                    </div>
                </div>
        </div>
    );
}


export default UserProfile;