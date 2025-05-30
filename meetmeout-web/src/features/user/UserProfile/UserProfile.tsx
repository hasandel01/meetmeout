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
import { FriendRequest } from "../../../types/FriendRequest";


const UserProfile = () => {

    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const { currentUser, getMe } = useUserContext();
    const [companions, setCompanions] = useState<User[]>([]);
    const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);
    const {userLatitude, userLongitude} = useLocationContext();
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [companionStatus, setCompanionStatus] = useState<FriendRequest |null>(null);
    const [statusLabel, setStatusLabel] = useState('');
    const [showRemove, setShowRemove] = useState(false);
    const [showCancel, setShowCancel] = useState(false);

    const getUserProfile = async () => {
        try {
            const response = await axiosInstance.get(`/${username}`);
            setUser(response.data);
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
        }
        catch (error) {
            console.error("Error fetching address:", error);
            return null;
        }
    }

    const getCompanions = async () => {
        try {
            const response = await axiosInstance.get(`/companions/${username}`);
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



    useEffect(() => {

        if(user) {
            getCompanionStatus();
        }
    },[user])


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

    const getCompanionStatus = async () => {
        try {
            const response = await axiosInstance.get(`/companions/${username}/status`);
            setCompanionStatus(response.data) 
            console.log(response.data)
        }catch(error) {

        }

    }

    useEffect(() => {

        if(companionStatus?.status === "PENDING")
            setStatusLabel("REQUEST SENT ✓")
        else if(companionStatus?.status === "ACCEPTED")
            setStatusLabel("COMPANION ✔")
        else if(companionStatus?.status === "NONE")
            setStatusLabel("SEND REQUEST!")

    },[companionStatus]);

        const sendFriendRequest = async () => {

            if(companionStatus?.status !== "NONE")
                return;

            if (!user?.email) {
                console.error("User email is undefined.");
                return;
            }

            try {
                await axiosInstance.post(`/companions/${encodeURIComponent(user.email)}`,
                    null);

                setStatusLabel(`REQUEST SENT ✓`)
                setCompanionStatus({...companionStatus, status: "PENDING"});
            }
            catch (error) {
            }
    }

    const handleLabelClick = () => {
        
        if(companionStatus?.status === "ACCEPTED")
            setShowRemove(prev => !prev);
        else if(companionStatus?.status === "NONE")
            sendFriendRequest();
        else if(companionStatus?.status === "PENDING")
            setShowCancel(prev => !prev)
    }

    const removeCompanion = async () => {
        
        try {

            if (!user?.email) {
                console.error("User email is undefined.");
                return;
            }

            await axiosInstance.delete(`/companions/${user.email}`)
                                
                setStatusLabel(`SEND REQUEST!`)
                setCompanionStatus(
                    companionStatus
                        ? { ...companionStatus, status: "NONE" }
                        : { id: "", status: "NONE", sender: user as User, receiver: currentUser as User }
                );
             
        }catch(error) {
        }
    }

    const cancelRequest = async () => {
        try {
            
            if(!user?.email)
                return;

            await axiosInstance.delete(`/companions/${user?.email}/cancel-request`);

                setStatusLabel(`SEND REQUEST!`)
                setCompanionStatus(
                    companionStatus
                        ? { ...companionStatus, status: "NONE" }
                        : { id: "", status: "NONE", sender: user as User, receiver: currentUser as User }
                );

        } catch(error) {

        }
    } 

    useEffect(() => {

        const handleMouseReset = (event: MouseEvent) => {

        const removeCompanion = document.querySelector(`.${styles.removeCompanion}`)
        
        if(removeCompanion && !removeCompanion.contains(event.target as Node))
            setShowRemove(false)

    }

        if(showRemove)
            document.addEventListener("mousedown",handleMouseReset)

        return () => {
            document.removeEventListener("mousedown", handleMouseReset)
        }


    },[showRemove]);
    

    return (
        <div className={styles.userProfile}>
            {user && showUserUpdateForm && <UserUpdateForm currentUser={user} onClose={() => setShowUserUpdateForm((prev) => !prev)} />}
            <div className={styles.userProfileHeader}>
                <div className={styles.userProfileDetails}> {
                    currentUser?.username !== username &&
                    <>
                        <div className={companionStatus?.status === "NONE" ? `${styles.companionStatusSendRequest}` : 
                        (companionStatus?.status === "ACCEPTED" ? `${styles.companionStatusAccepted}` : `${styles.companionStatusRequestSent}` )}
                            onClick={() => handleLabelClick()}>
                            <p>{statusLabel}</p>
                            {companionStatus?.status === "ACCEPTED" && showRemove &&
                            <div className={styles.removeCompanion} onClick={() => removeCompanion()}>
                                <p>Remove</p>
                            </div>
                            }
                            {companionStatus?.status === "PENDING" && showCancel && 
                             <div className={styles.removeCompanion} onClick={() => cancelRequest()}>
                                <p>Cancel</p>
                            </div>}
                        </div>
                    </>
                    }
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