import styles from "./MainFeed.module.css";
import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { useState } from "react";
import { Event } from "../../types/Event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCalendar, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faHeart, faShare, faComment } from "@fortawesome/free-solid-svg-icons";
import { getCategoryIconLabel } from "../../mapper/CategoryMap";
import { useNavigate } from "react-router-dom";

const MainFeed = () => {
 
    const [events, setEvents] = useState<Event[] | null>([]);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const navigate = useNavigate();

    const getEvents = async () => {

        const response = await axiosInstance.get("/get-ongoing-events", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        setEvents(response.data);
        return response.data;
    };


    useEffect(() => {
        getEvents();
    }, []);


    const goToEventDetails = (eventId: number) => {
        navigate(`/event/${eventId}`);
    };

    return (
        <div className={styles.onGoingEventsContainer}>
            <h3>Ongoing Events!</h3>
                {events && events.length > 0 ? (
                    events.map((event) => (
                        event.isPrivate === false && event.isDraft === false && 
                        (
                            <div key={event.id} onClick={() => goToEventDetails(event.id)}>
                                <div className={styles.eventCard}>
                                    <img src={event.imageUrl} alt={event.title} />
                                    <div className={`${styles.eventStatus} ${styles[event.status]}`}> {event.status}</div>
                                    <h2>{event.title}</h2>
                                    <p>{event.description}</p>
                                    <p>{event.tags.join(", ")}</p>
                                    <div className={styles.eventTimeDate}>
                                        <span>
                                            <FontAwesomeIcon icon={faCalendar} className="event-icon" />
                                            <p > {new Date(event.date).toLocaleDateString("en-US", options)}</p>
                                        </span>
                                        <span>
                                            <FontAwesomeIcon icon={faClock} className="event-icon" />
                                            <p>{event.time}</p>
                                        </span>
                                    </div>
                                    <p>{event.addressName}</p>
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
                                        {event.organizer && (
                                            <div className={styles.eventOrganizer}>
                                                <img src={event.organizer.profilePictureUrl} alt={event.organizer.profilePictureUrl} className="event-organizer-image" />
                                                <p>{event.organizer.firstName} {event.organizer.lastName}</p>
                                            </div>
                                        )}
                                <div className={styles.eventParticipants}>
                                    <FontAwesomeIcon icon={faUserGroup} className="event-icon" />
                                    <p>{event.attendees.length}/{event.maximumCapacity}</p>
                                </div>
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
                                     <button className={styles.joinButton}>Join Event</button>
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
    )
}

export default MainFeed;
