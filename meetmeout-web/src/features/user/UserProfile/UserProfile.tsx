import { useEffect, useState } from "react";
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import styles from "./UserProfile.module.css";
import { faCamera, faLocationDot, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import UserUpdateForm from "../UserUpdateForm/UserUpdateForm";
import { useUserContext } from "../../../context/UserContext";
import { useLocationContext } from "../../../context/LocationContex";
import axios from "axios";


const UserProfile = () => {

    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const { currentUser, getMe } = useUserContext();
    const [companions, setCompanions] = useState<User[]>([]);
    const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);
    const {userLatitude, userLongitude} = useLocationContext();
    const [userLocation, setUserLocation] = useState<string | null>(null);

    const getUserProfile = async () => {
        try {
            const response = await axiosInstance.get(`/${username}`);
            setUser(response.data);
            console.log("User profile fetched successfully:", response.data);
    }   catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const getAddressFromCoords = async () => {


        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${userLatitude}&lon=${userLongitude}&format=json`);
            
            const address = response.data.address as {
            road? :string;
            village?: string;
            town?: string;
            suburb?: string;
            neighbourhood: string;
            city?: string;
            county?: string;
            state?: string;
            hamlet?: string;
            }

            let mostSpecific =
            address.road ||
            address.neighbourhood ||
            address.village ||
            address.hamlet ||
            '';

            let district =
            address.town ||
            address.suburb ||
            '';

            let city =
            address.city ||
            address.county ||
            address.state ||
            '';

            const parts = [mostSpecific, district, city].filter(Boolean);
            const fallbackName = parts.join(', ');
            setUserLocation(fallbackName || "Unknown Location");
            console.log("User location fetched successfully:", fallbackName);

        }
        catch (error) {
            console.error("Error fetching address:", error);
            return null;
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

    useEffect(() => {
        getUserProfile();
        getCompanions();
    }, []);

    useEffect(() => {
        if (userLatitude && userLongitude) {
            getAddressFromCoords();
        }   
    }
    , [userLatitude, userLongitude]);


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
                        {userLatitude && userLongitude &&  (
                            ((currentUser?.username !== user?.username && user?.showLocation) || (currentUser?.username === user?.username)) ? (
                            <p><FontAwesomeIcon icon={faLocationDot}/> {userLocation}</p>
                        ) : (
                            <p></p>))}                  
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
                                            <div className={styles.badgeInfo}>
                                                <h4>{badge.title}</h4>
                                                <p>{badge.description}</p>
                                            </div>
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