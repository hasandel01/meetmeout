import styles from "./MainFeed.module.css";
import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { useState } from "react";
import { Event } from "../../types/Event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faSort, faLock} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { getCategoryIconLabel } from "../../mapper/CategoryMap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User } from "../../types/User";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from "react-tooltip";

const MainFeed = () => {
 
    const [events, setEvents] = useState<Event[] | null>([]);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<User | null>();
    const [loading, setLoading] = useState(true);
    const [requestSentEvents, setRequestSentEvents] = useState<Event[]>([]);

    const getEvents = async () => {

        try {
            const response = await axiosInstance.get("/get-events");
            setEvents(response.data);
        }
        catch(error) {
            toast.error("Error catching events!")
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        getEvents();
        getMe();
        getRequestSentEvents();
    }, []);


    const goToEventDetails = (eventId: number) => {
        navigate(`/event/${eventId}`);
    };
    
    const searchQuery = (searchString: string) => {

            if(!events) return;
    
            const sortedEvents = [...events]?.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return searchString === 'Most Recent' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime(); 
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
        return event.attendees.some(element => element.username === currentUser?.username) || requestSentEvents.some(requestSentEvents => requestSentEvents.id === event.id)
    }

    const handleLike = async (eventId: number) => {
        if (!currentUser) return;
      
        const alreadyLiked = events?.find(ev => ev.id === eventId)
          ?.likes.some(like => like.username === currentUser.username);
      
        setEvents(prevEvents =>
          prevEvents?.map(ev => {
            if (ev.id !== eventId) return ev;
      
            const updatedLikes = alreadyLiked
              ? ev.likes.filter(like => like.username !== currentUser.username)
              : [...ev.likes, {
                  id: 0, 
                  username: currentUser.username,
                  eventId: ev.id
                }];
      
            return {
              ...ev,
              likes: updatedLikes
            };
          }) || []
        );
      
        try {
          await axiosInstance.post(`/like-event/${eventId}`);
        } catch (error) {
          setEvents(prevEvents =>
            prevEvents?.map(ev => {
              if (ev.id !== eventId) return ev;
      
              const rolledBackLikes = alreadyLiked
                ? [...ev.likes, {
                    id: 0,
                    username: currentUser.username,
                    eventId: ev.id
                  }]
                : ev.likes.filter(like => like.username !== currentUser.username);
      
              return {
                ...ev,
                likes: rolledBackLikes
              };
            }) || []
          );
      
          toast.error("Like işlemi başarısız oldu");
        }
      };
      

    const getRequestSentEvents = async () => {

        try {
            const response = await axiosInstance.get(`/get-request-sent-events`)
            setRequestSentEvents(response.data)
        } catch(error) {
            toast.error("Error getting request sent  events.")
        }
    } 
      

    return (
        <div className={styles.mainFeedContainer}>
            <div className={styles.mainFeedContainerHeader}>
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
            </div>
        <div className={styles.onGoingEventsContainer}>
                { loading ? (
                    <>                          
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                    </>

                ) : events && events.length > 0 ? (
                    events.map((event) => (
                        event.isDraft === false && 
                        (
                            <div key={event.id} onClick={() => goToEventDetails(event.id)}>
                                <div className={styles.eventCard}>
                                    {event.isPrivate && 
                                    <><FontAwesomeIcon
                                            icon={faLock}
                                            className={styles.lockIcon}
                                            data-tooltip-id="private_event_tooltip" data-tooltip-content="Private Event" />
                                            <Tooltip id="private_event_tooltip"/>
                                    </>}
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
                                    <div className={styles.eventDetailsInfo}>
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
                                    </div>
                                    <div className={styles.eventActions}>
                                    <div className={styles.buttonGroup} data-tooltip-id="event_like" data-tooltip-content="Like">
                                        <FontAwesomeIcon 
                                            icon={
                                                event.likes.some(u => u.username === currentUser?.username)
                                                ? faHeart
                                                : regularHeart} 
                                            className={styles.heartIcon}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(event.id)
                                            }}
                                            />
                                            <Tooltip id="event_like"/>
                                        <span>{event.likes.length > 0 ? `${event.likes.length}` : ""}</span>
                                    </div>
                                    <div className={styles.buttonGroup}>
                                        <FontAwesomeIcon 
                                            onClick={ (e) => {
                                                e.stopPropagation();
                                                navigate(`/event/${event.id}#comments`)
                                            }}
                                            icon={faComment} 
                                            className={styles.commentIcon} />
                                        <span>{event.comments.length > 0 ? `${event.comments.length}` : ""}</span>
                                    </div>
                                </div>
                                {event.organizer?.username !== currentUser?.username &&
                                    <button disabled={isDisabled(event)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoinEvent(event.id)}} 
                                        className={styles.joinButton}>
                                        {event.isPrivate ? (
                                            requestSentEvents.some(requestSentEvent => requestSentEvent.id === event.id) ?
                                            "Sent request!"
                                            :
                                            "Send Join Request!"
                                        )
                                             
                                             
                                             
                                             : "Join" }
                                    </button> }
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
