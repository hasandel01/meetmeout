import { useEffect, useState } from "react";
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import styles from "./UserProfile.module.css";
import { faCamera, faCalendar, faLocationDot, faPenToSquare, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useParams } from "react-router-dom";
import UserUpdateForm from "../UserUpdateForm/UserUpdateForm";
import { useUserContext } from "../../../context/UserContext";
import { useLocationContext } from "../../../context/LocationContex";
import axios from "axios";
import { FriendRequest } from "../../../types/FriendRequest";
import { Event } from "../../../types/Event";
import qs from 'qs';
import { calculateDistance } from "../../../utils/calculateDistance";
import { getOrganizerRatingDescription } from "../../../utils/getOrganizerRatingDescription";
import { formatMonthYear } from "../../../utils/formatTime";
import { TravelAssociate } from "../../../types/TravelAssociate";

function UserProfile() {

    const { username } = useParams<{ username: string; }>();
    const [user, setUser] = useState<User | null>(null);
    const { currentUser, getMe } = useUserContext();
    const [companions, setCompanions] = useState<User[]>([]);
    const [showUserUpdateForm, setShowUserUpdateForm] = useState(false);
    const { userLatitude, userLongitude } = useLocationContext();
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [companionStatus, setCompanionStatus] = useState<FriendRequest | null>(null);
    const [statusLabel, setStatusLabel] = useState('');
    const [showRemove, setShowRemove] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
    const [attendedEvents, setAttendedEvents] = useState<Event[]>([]);
    const [travelAssociates,setTravelAssociates] = useState<TravelAssociate[] | null>(null);

    const navigate = useNavigate();

    const getUserProfile = async () => {
        try {
            const response = await axiosInstance.get(`/${username}`);
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const getAddressFromCoords = async () => {


        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${userLatitude}&lon=${userLongitude}&format=json`);

            const address = response.data.address as {
                road?: string;
                village?: string;
                town?: string;
                suburb?: string;
                neighbourhood: string;
                city?: string;
                county?: string;
                state?: string;
                hamlet?: string;
            };

            let mostSpecific = address.road ||
                address.neighbourhood ||
                address.village ||
                address.hamlet ||
                '';

            let district = address.town ||
                address.suburb ||
                '';

            let city = address.city ||
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
    };

    const getCompanions = async () => {
        try {
            const response = await axiosInstance.get(`/companions/${username}`);
            console.log("Companion profile fetched successfully:", response.data);
            setCompanions(response.data);
        }
        catch (error) {
            console.error("Error fetching companion profile:", error);
        }
    };

    useEffect(() => {
        setUser(null);
        getUserProfile();
        getCompanions();
    }, [username]);

    useEffect(() => {
        if (userLatitude && userLongitude) {
            getAddressFromCoords();
        }
    },
        [userLatitude, userLongitude]);



    useEffect(() => {

        if (user) {
            getCompanionStatus();
            fetchAverageRatingForUser();
            getUserOrganizedEventsByIds();
            getUserAttendedEventsByIds();
            getTopTravelAssocaites();
        }
    }, [user]);


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
            };
            fileInput.click();
        }
        catch (error) {
            console.error("Error creating file input:", error);
        }
    };

    const updateProfile = async () => {
        setShowUserUpdateForm(prev => !prev);
    };

    const getCompanionStatus = async () => {
        try {
            const response = await axiosInstance.get(`/companions/${username}/status`);
            setCompanionStatus(response.data);
            console.log(response.data);
        } catch (error) {
        }

    };

    useEffect(() => {

        if (companionStatus?.status === "PENDING")
            setStatusLabel("REQUEST SENT ✓");
        else if (companionStatus?.status === "ACCEPTED")
            setStatusLabel("COMPANION ✔");
        else if (companionStatus?.status === "NONE")
            setStatusLabel("SEND REQUEST!");

    }, [companionStatus]);

    const sendFriendRequest = async () => {

        if (companionStatus?.status !== "NONE")
            return;

        if (!user?.email) {
            console.error("User email is undefined.");
            return;
        }

        try {
            await axiosInstance.post(`/companions/${encodeURIComponent(user.email)}`,
                null);

            setStatusLabel(`REQUEST SENT ✓`);
            setCompanionStatus({ ...companionStatus, status: "PENDING" });
        }
        catch (error) {
        }
    };

    const handleLabelClick = () => {

        if (companionStatus?.status === "ACCEPTED")
            setShowRemove(prev => !prev);
        else if (companionStatus?.status === "NONE")
            sendFriendRequest();
        else if (companionStatus?.status === "PENDING")
            setShowCancel(prev => !prev);
    };

    const handleUserUpdate = async () => {
        await getMe();
        await getUserProfile();
        setShowUserUpdateForm((prev) => !prev)
    }

    const removeCompanion = async () => {

        try {

            if (!user?.email) {
                console.error("User email is undefined.");
                return;
            }

            await axiosInstance.delete(`/companions/${user.email}`);

            setStatusLabel(`SEND REQUEST!`);
            setCompanionStatus(
                companionStatus
                    ? { ...companionStatus, status: "NONE" }
                    : { id: "", status: "NONE", sender: user as User, receiver: currentUser as User }
            );

        } catch (error) {
        }
    };

    const cancelRequest = async () => {
        try {

            if (!user?.email)
                return;

            await axiosInstance.delete(`/companions/${user?.email}/cancel-request`);

            setStatusLabel(`SEND REQUEST!`);
            setCompanionStatus(
                companionStatus
                    ? { ...companionStatus, status: "NONE" }
                    : { id: "", status: "NONE", sender: user as User, receiver: currentUser as User }
            );

        } catch (error) {
        }
    };

    useEffect(() => {

        const handleMouseReset = (event: MouseEvent) => {

            const removeCompanion = document.querySelector(`.${styles.removeCompanion}`);

            if (removeCompanion && !removeCompanion.contains(event.target as Node))
                setShowRemove(false);

        };

        if (showRemove)
            document.addEventListener("mousedown", handleMouseReset);

        return () => {
            document.removeEventListener("mousedown", handleMouseReset);
        };


    }, [showRemove]);


    const [tab, setTab] = useState(1);


    const fetchAverageRatingForUser = async () => {

        try {

            const response = await axiosInstance.get(`/${user?.username}/average-rating`);
            setAverageRating(response.data);
        } catch (error) {
        }

    };

    
    const isStartDateAndEndDateSame = (event: Event): boolean => {
        return new Date(event.startDate).toLocaleDateString() === new Date(event.endDate).toLocaleDateString();
    };


    const getUserOrganizedEventsByIds = async () => {
        try {
            if (user) {
                const response = await axiosInstance.get(`/events/with-ids`, {
                    params: { ids: user.organizedEventIds },
                    paramsSerializer: (params) => {
                        return qs.stringify(params, { arrayFormat: 'repeat' }); // --> ids=1&ids=2
                    }
                });
                setOrganizedEvents(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const getUserAttendedEventsByIds = async () => {
        try {
            if (user) {
                const response = await axiosInstance.get(`/events/with-ids`, {
                    params: { ids: user.participatedEventIds },
                    paramsSerializer: (params) => {
                        return qs.stringify(params, { arrayFormat: 'repeat' });
                    }
                });
                setAttendedEvents(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };


    const getTopTravelAssocaites = async () => {

        try {
            const response = await axiosInstance.get(`/top-travel-associates/${user?.username}`)
            setTravelAssociates(response.data);
        } catch(error) {
            console.log(error)
        }
    }

     const handleLocationClick = (event: Event) => {
          navigate("/", {
            state: {
              flyTo: {
                lat: event.latitude,
                lng: event.longitude,
              }
            }
          })
        }

    const handleUserLocationClick = () => {
        navigate("/", {
            state: {
            flyTo: {
                lat: userLatitude,
                lng: userLongitude,
            }
            }
        })
    }

    return (
        <div className={styles.userProfile}>
                {showUserUpdateForm && (
                    <UserUpdateForm
                        currentUser={user as User}
                        onClose={() => handleUserUpdate()}
                    />
                )}
            <div className={styles.userProfileDetails}>
                <div className={styles.userInfo}>
                    <div className={styles.userProfileHeader}>
                    {currentUser?.username !== username &&
                        <div className={companionStatus?.status === "NONE" ? `${styles.companionStatusSendRequest}` :
                            (companionStatus?.status === "ACCEPTED" ? `${styles.companionStatusAccepted}` : `${styles.companionStatusRequestSent}`)}
                            onClick={() => handleLabelClick()}>
                            <p>{statusLabel}</p>
                            {companionStatus?.status === "ACCEPTED" && showRemove &&
                                <div className={styles.removeCompanion} onClick={() => removeCompanion()}>
                                    <p>Remove</p>
                                </div>}
                            {companionStatus?.status === "PENDING" && showCancel &&
                                <div className={styles.removeCompanion} onClick={() => cancelRequest()}>
                                    <p>Cancel</p>
                                </div>}
                        </div>}
                    {currentUser?.username === username && 
                        <FontAwesomeIcon
                            icon={faPenToSquare}
                            size="2x"
                            className={styles.updateIcon}
                            onClick={updateProfile}
                            title="Update Profile"
                        ></FontAwesomeIcon>
                        }
                </div>
                    <div className={styles.about}>
                        <div className={styles.profile}>
                            <div className={styles.profilePicture}>
                                <img src={user?.profilePictureUrl} alt="User Profile" />
                                {currentUser && currentUser.username === username && (
                                    <span className={styles.cameraOverlay} onClick={updateProfilePicture}> <FontAwesomeIcon icon={faCamera} size="2x" /></span>
                                )}
                            </div>
                            <div className={styles.user}>
                                <h4>{user?.firstName} {user?.lastName}</h4>
                                <h5>@{user?.username}</h5>
                            </div>
                        </div>
                        <div className={styles.infoCard}>
                            <h5>About</h5>
                            <hr />
                            <p> {user?.about}</p>
                        </div>
                        <div className={styles.contacts}>
                        <h5>Contacts</h5>
                        <hr />
                        <div className={styles.contactItem}>
                                <h6>Phone</h6>
                                <p>{user?.phone?.trim() ? `+` + user.phone : "Not provided."}</p>
                            </div>
                            <div className={styles.contactItem}>
                                <h6>E-mail</h6>
                                <p>{user?.email?.trim() ? user.email : "Not provided."}</p>
                            </div>
                        </div>
                        <div className={styles.organizerRating}>
                            <h5>As Organizer</h5>
                            <hr />
                            <p><FontAwesomeIcon icon={faThumbsUp} /> {averageRating ?? "N/A"}</p>
                            <small>{getOrganizerRatingDescription(averageRating,
                                                                currentUser?.username === user?.username,
                                                                !!(user?.userReviews && user.userReviews.length > 0))}</small>
                        </div>
                    </div>
                </div>
                <div className={styles.activeAndLocation}>
                    <h5 className={styles.activeLabel}>Active Since: {formatMonthYear(user?.createdAt ?? "")} 🚀</h5>
                    {((currentUser?.username !== user?.username && user?.showLocation) || (currentUser?.username === user?.username)) && (
                    <p
                        className={`${styles.userLocationFixed} ${currentUser?.username === user?.username ? styles.clickable : ''}`}
                        onClick={currentUser?.username === user?.username ? handleUserLocationClick : undefined}>
                        <FontAwesomeIcon icon={faLocationDot} /> {userLocation}
                </p>
                )}
                </div>
                <hr />
                <div className={styles.tabContainer}>
                    <div className={styles.tabMenu}>
                    <label
                        className={tab === 1 ? styles.activeTab : ''}
                        onClick={() => setTab(1)}
                    >
                        <h5>Participated Events</h5>
                        <h5>({user?.participatedEventIds?.length})</h5>
                    </label>

                    <label
                        className={tab === 2 ? styles.activeTab : ''}
                        onClick={() => setTab(2)}
                    >
                        <h5>Created Events</h5>
                        <h5>({user?.organizedEventIds?.length})</h5>
                    </label>

                    <label
                        className={tab === 3 ? styles.activeTab : ''}
                        onClick={() => setTab(3)}
                    >
                        <h5>Companions</h5>
                        <h5>({companions.length})</h5>
                    </label>
                    <label
                        className={tab === 4 ? styles.activeTab : ''}
                        onClick={() => setTab(4)}
                    >
                        <h5>Travel Associates</h5>
                        <h5>({travelAssociates?.length ?? 0})</h5>
                    </label>
                    <label
                        className={tab === 5 ? styles.activeTab : ''}
                        onClick={() => setTab(5)}
                    >
                        <h5>Trophies</h5>
                        <h5>({user?.badges.length})</h5>
                    </label>
                    </div>

                    <hr/>
                    {tab === 1 && (
                        attendedEvents.length > 0 ? (
                            <div className={styles.eventsContainer}>
                            {attendedEvents.map(event => (
                                <div className={styles.eventCard} key={event.id} >
                                <div className={styles.eventImage}>
                                    <img src={event.imageUrl} alt={event.title} />
                                </div>

                                <div className={styles.eventInfo} onClick={() => navigate(`/event/${event.id}`)}>
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                </div>

                                <div className={styles.eventDetails}>
                                    <div className={styles.eventTimeDate} onClick={currentUser?.username === user?.username ? 
                                                                                    () => navigate("/my-calendar", {state: {highlightedEventId: event.id, 
                                                                                                                            date: event.startDate}} ) : undefined}>
                                    <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                                    <p>
                                        {new Date(event.startDate).toLocaleDateString("en-US", dateOptions)}
                                        {!isStartDateAndEndDateSame(event) && (
                                        <> - {new Date(event.endDate).toLocaleDateString("en-US", dateOptions)}</>
                                        )}
                                        <br />
                                        {event.startTime} - {event.endTime}
                                    </p>
                                    </div>
                                    <div className={styles.eventLocation} onClick={() => handleLocationClick(event)}>
                                    <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                                    <p>{event.addressName}</p>
                                    {userLongitude !== 0 && userLatitude !== 0 && (
                                        <p>({calculateDistance(event, userLatitude, userLongitude).toFixed(1)} km away)</p>
                                    )}
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>
                            ) : (
                                currentUser?.username === user?.username ? 
                                <p>You haven't been in any event yet.</p>
                                :
                                <p>This user hasn't been in any event yet. </p>
                            )
                    )}
                    {tab === 2 && (
                        organizedEvents.length > 0 ? (
                        <div className={styles.eventsContainer}>
                            {organizedEvents.map(event => (
                                <div className={styles.eventCard} key={event.id}>
                                <div className={styles.eventImage}>
                                    <img src={event.imageUrl} alt={event.title} />
                                </div>

                                <div className={styles.eventInfo}  onClick={() => navigate(`/event/${event.id}`)}>
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                </div>

                                <div className={styles.eventDetails}>
                                    <div className={styles.eventTimeDate} onClick={currentUser?.username === user?.username ? 
                                                                                    () => navigate("/my-calendar", {state: {highlightedEventId: event.id, 
                                                                                                                            date: event.startDate}} ) : undefined}>
                                    <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                                    <p>
                                        {new Date(event.startDate).toLocaleDateString("en-US", dateOptions)}
                                        {!isStartDateAndEndDateSame(event) && (
                                        <> - {new Date(event.endDate).toLocaleDateString("en-US", dateOptions)}</>
                                        )}
                                        <br />
                                        {event.startTime} - {event.endTime}
                                    </p>
                                    </div>

                                    <div className={styles.eventLocation} onClick={() => handleLocationClick(event)}>
                                    <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                                    <p>{event.addressName}</p>
                                    {userLongitude !== 0 && userLatitude !== 0 && (
                                        <p>({calculateDistance(event, userLatitude, userLongitude).toFixed(1)} km away)</p>
                                    )}
                                    </div>
                                </div>
                                </div>
                            ))}
                            </div>
                        ) : (
                            currentUser?.username === user?.username ? 
                            <p>You haven't created any event yet.</p>
                            :
                            <p>This user hasn't created any event yet.</p>
                        ))}
                    {tab === 3 && (
                        companions.length > 0 ? 
                        (
                        <div className={styles.companionsContainer}>
                            {companions.map(companion => (
                                <div key={companion.username} className={styles.companion} onClick={() => navigate(`/user-profile/${companion.username}`)}>
                                    <img src={companion.profilePictureUrl}></img>
                                    <h6>{companion.firstName} {companion.lastName}</h6>
                                    <p>{companion.username}</p>
                                </div>
                            ))}
                        </div>)
                        : (
                            currentUser?.username === user?.username ? 
                            <p>You don't have any companions on your journey.</p>
                            :
                            <p>This user doesn't have any companions.</p>
                        ))}
                    {tab === 4 && (
                        travelAssociates && travelAssociates.length > 0 ? (
                            <>
                            <div className={styles.companionsContainer}>
                                {travelAssociates.map(associate => (
                                    <div
                                        key={associate.user.username}
                                        className={styles.companion}
                                        onClick={() => navigate(`/user-profile/${associate.user.username}`)}
                                    >
                                        <img src={associate.user.profilePictureUrl} alt="profile" />
                                        <h6>{associate.user.firstName} {associate.user.lastName}</h6>
                                        <p>{associate.user.username}</p>
                                        <small>{associate.number} events together!</small>
                                    </div>
                                ))}
                            </div>
                            <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--primary-color-dark)' }}>
                                Total travel companions: {travelAssociates.length}
                            </p>
                            </>
                        ) : (
                            currentUser?.username === user?.username ?
                            <p>You don't have any travel associates yet.</p> :
                            <p>This user doesn't have any travel associates.</p>
                        )
                    )}
                    {tab === 5 && user?.badges && (
                        user.badges.length > 0 ? (
                        <div className={styles.badgeContainer}>
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
                                        );
                                    })}
                            </ul>
                        </div>)
                        : (
                            <p>No trophies unlocked.</p>
                        )
                    )}
                </div>
            </div>

        </div>
    );
}


export default UserProfile;