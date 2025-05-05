import styles from "./MainFeed.module.css";
import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { useState } from "react";
import { Event } from "../../types/Event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faSort} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faShare, faComment } from "@fortawesome/free-solid-svg-icons";
import { getCategoryIconLabel } from "../../mapper/CategoryMap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User } from "../../types/User";

const MainFeed = () => {
 
    const [events, setEvents] = useState<Event[] | null>([]);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>();

    const getEvents = async () => {

        const response = await axiosInstance.get("/get-events",
        );
        console.log(response.data)
        setEvents(response.data);
        return response.data;
    };

    useEffect(() => {
        getEvents();
        getMe();
    }, []);


    const goToEventDetails = (eventId: number) => {
        navigate(`/event/${eventId}`);
    };
    
    const searchQuery = (searchString: string) => {

            if(!events) return;
    
            const sortedEvents = [...events]?.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return searchString === 'Most Recent' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime(); 
            })

            setEvents(sortedEvents);
        
    }

    const handleJoinEvent = async (eventId: number) => {

        try {

            const response = await axiosInstance.post(`/join-event/${eventId}`);

            if(response.status === 200) {
                toast.success("You successfully joined to the event!")
            }
            else {
                toast.error("You couldn't join to the event.")
            }

        } catch(error) {
            toast.error("You couldn't join to the event.")
        }

    }


    const getMe = async () => {
    
        try {
    
            const response = await axiosInstance.get("/me");
            setCurrentUser(response.data);
        } catch(error) {
          console.error("Error fetching user data:", error);
        }
    
    }

    const isDisabled = (event: Event) => {
        return event.attendees.some(element => element.username === currentUser?.username)
    }

    return (
        <div className={styles.mainFeedContainer}>
            <header>
                <div className={styles.sort}>
                    <FontAwesomeIcon icon={faSort}>
                    </FontAwesomeIcon>
                    <select onChange={(e) => searchQuery(e.target.value)}>
                        <option
                            value="Most Recent">
                            Most Recent
                        </option>
                        <option
                            value="Least Recent">
                            Least Recent
                        </option>
                    </select>
                </div>
            </header>
        <div className={styles.onGoingEventsContainer}>
                {events && events.length > 0 ? (
                    events.map((event) => (
                        event.isPrivate === false && event.isDraft === false && 
                        (
                            <div key={event.id} onClick={() => goToEventDetails(event.id)}>
                                <div className={styles.eventCard}>
                                    <div className={`${styles.eventStatus} ${styles[event.status]}`}> {event.status}</div>
                                    <img src={event.imageUrl} alt={event.title} />
                                    <div className={styles.eventTitle}>
                                        <div className={styles.eventCategory}>
                                                {(() => {
                                                    const category = getCategoryIconLabel(event.category);
                                                    return (
                                                        <span style={{ color: category.color }}>
                                                            {category.icon} {category.label}
                                                        </span>
                                                    );
                                                })()}
                                        </div>
                                        <h2>{event.title}</h2>
                                    </div>
                                    <div className={styles.eventTimeDate}>
                                        <span>
                                            <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                                            <p > {new Date(event.date).toLocaleDateString("en-US", options)} <strong>&bull;</strong> {event.time}</p>
                                        </span>
                                    </div>
                                    <div className={styles.eventLocation}>
                                        <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                                        <p>{event.addressName}</p>
                                    </div>
                                    <div className={styles.tags}>
                                    <p>{event.tags.join(" ")}</p>
                                    </div>
                                        {event.organizer && (
                                            <div className={styles.eventOrganizer}>
                                                <img src={event.organizer.profilePictureUrl} alt={event.organizer.profilePictureUrl} className="event-organizer-image" />
                                                <p>{event.organizer.firstName} {event.organizer.lastName}</p>
                                            </div>
                                        )}
                                <div className={styles.eventActions}>
                                    <button className="heart-button">
                                        <FontAwesomeIcon icon={faHeart} className="heart-icon" />
                                    </button>
                                    <button className="share-button">
                                        <FontAwesomeIcon icon={faShare} className="share-icon" />
                                    </button>
                                    <button className="comment-button">
                                        <FontAwesomeIcon icon={faComment} className="comment-icon" />
                                    </button>
                                     <button disabled={isDisabled(event)}
                                            onClick={() => handleJoinEvent(event.id)} 
                                            className={styles.joinButton}>
                                            Join Event 
                                    </button>
                                </div>
                                </div>
                            </div>            
                        )
                    )))
                : (
                    <div className="no-events">
                        <h2>No ongoing events. The world is chill 😎</h2>
                    </div>
                )}

        </div>
    </div>

    )
}

export default MainFeed;
