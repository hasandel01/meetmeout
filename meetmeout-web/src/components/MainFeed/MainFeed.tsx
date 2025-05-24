import styles from "./MainFeed.module.css";
import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { useState } from "react";
import { Event } from "../../types/Event";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faLock} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment, faStar } from "@fortawesome/free-solid-svg-icons";
import { getCategoryIconLabel } from "../../mapper/CategoryMap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from "react-tooltip";
import { useUserContext } from "../../context/UserContext";
import { Invitation } from "../../types/Like";
import MainFeedMap from "./MainFeedMap/MainFeedMap";
import { MapContainer } from "react-leaflet";
import { TileLayer } from "react-leaflet";
import MapPanner from "./MainFeedMap/MainFeedMapPanner/MainFeedMapPanner";

const isStartDateAndEndDateSame = (event: Event): boolean => {
    return new Date(event.startDate).toLocaleDateString() === new Date(event.endDate).toLocaleDateString();
};

const EventRatingStars = ({ eventId }: { eventId: number }) => {
    const [average, setAverage] = useState<number>(0);

    useEffect(() => {
        const fetchAverageRating = async () => {
            try {
                const response = await axiosInstance.get(`/events/${eventId}/average-rating`);
                if (response.status === 200) {
                    setAverage(response.data);
                } else {
                    toast.error("Error getting average rating");
                }
            } catch (error) {
                toast.error("Error getting average rating");
            }
        };

        fetchAverageRating();
    }, [eventId]);

    return (
        <div className={styles.eventRatings}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={styles.starIcon}
                    style={{ color: average >= star ? "gold" : "gray" }}
                />
            ))}
        </div>
    );
};

const MainFeed = () => {
 
    const [events, setEvents] = useState<Event[] | null>([]);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const navigate = useNavigate();
    const {currentUser} = useUserContext();
    const [loading, setLoading] = useState(true);
    const [requestSentEvents, setRequestSentEvents] = useState<Event[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [lng, setLng] = useState<number | undefined>(0);
    const [lat, setLat] = useState<number | undefined>(0);
    const [globalFilter, setGlobalFilter] = useState('All Events');
    const [showPastEvents, setShowPastEvents] = useState(false);


    const location = useLocation();
    const flyTo = location.state?.flyTo;

    if(flyTo) {
        sessionStorage.setItem("flyTo", JSON.stringify({
        lat: flyTo.latitude,
        lng: flyTo.longitude
        }));
    }

    useEffect(() => {
        Promise.all([
            getEvents(), 
            getInvitations(),
            getRequestSentEvents()]
        ).finally(() => setLoading(false))
    }, []);

    const getEvents = async () => {
        return axiosInstance.get("/events")
        .then(res => setEvents(res.data))
        .catch(() => toast.error("Error getting events."));
    };

    const getInvitations = async () => {
        return axiosInstance.get("/events/invitations")
            .then(res => setInvitations(res.data))
            .catch(() => toast.error("Error getting invitations"));
    };

    const getRequestSentEvents = async () => {
        return axiosInstance.get("/events/request-sent")
            .then(res => setRequestSentEvents(res.data))
            .catch(() => toast.error("Error getting request sent events."));
    };

    useEffect(() => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                } 
            )
        }
    },[])



    const isEventFull =(event: Event):boolean =>  {

        return event.maximumCapacity <= event.attendees.length;

    } 

    
    const searchQuery = (searchString: string) => {

        if(!events) return;

        if(searchString === "Soonest" || searchString === "Latest" ) {
            
            const sortedEvents = [...events]?.sort((a, b) => {
                const dateA = new Date(`${a.startDate}T${a.startTime}`);
                const dateB = new Date(`${b.startDate}T${b.startTime}`);
                return searchString === 'Soonest' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime(); 
            })

            setEvents(sortedEvents);
        }
        else if(searchString === "Recently Added" ) {

            const sortedEvents = [...events]?.sort((a,b) => {
                const timeA = new Date(a.createdAt);
                const timeB = new Date(b.createdAt);
                return timeB.getTime() - timeA.getTime();
            })

            setEvents(sortedEvents);
        } else if(searchString === "Most Liked") {

            const sortedEvents = [...events]?.sort( (a,b) => {
                return b.likes.length - a.likes.length;
            })

            setEvents(sortedEvents)

        } else if(searchString === "Most Attended") {
            
            const sortedEvents = [...events]?.sort( (a,b) => {
                return b.attendees.length - a.attendees.length;
            })
            setEvents(sortedEvents)
        } else if(searchString === "Nearest") {
              
            const sortedEvents = [...events]?.sort((a, b) => {
                return calculateDistance(a) - calculateDistance(b);
            });

            setEvents(sortedEvents);
        }
    
        
    }

        const calculateDistance = (event: Event): number => {
            if (lat === undefined || lng === undefined || !event.latitude || !event.longitude) {
                return Number.MAX_SAFE_INTEGER; 
            }

            const R = 6371;
            const toRad = (value: number) => value * Math.PI / 180;

            const dLat = toRad(event.latitude - lat);
            const dLon = toRad(event.longitude - lng);

            const lat1 = toRad(lat);
            const lat2 = toRad(event.latitude);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.asin(Math.sqrt(a));
            return R * c;
        };


    const handleJoinEvent = async (eventId: number) => {

        try {

            const response = await axiosInstance.post(`/events/${eventId}/join`);

            if(response.status === 200) {
                navigate(`/event/${eventId}`)
            }
            else {
                toast.error("You couldn't join to the event.")
            }

        } catch(error) {
            toast.error("You couldn't join to the event.")
        }

    }

    const isDisabled = (event: Event) => {
        return requestSentEvents.some(requestSentEvents => requestSentEvents.id === event.id) || invitations.some(invitation => invitation.eventId === event.id)
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
          await axiosInstance.post(`/events/${eventId}/like`);
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


    const globalFilterFunction = () => {
    
        if(globalFilter === 'My Drafts')
            return events?.filter(event => event.isDraft)
        else if(globalFilter === 'My Events')
            return events?.filter(event => event.attendees.some(attendee => attendee.username === currentUser?.username) && !event.isDraft)
        else if(globalFilter === 'All Events')
            return events?.filter(event => !event.isDraft)
    }
      
    return (
        <div className={styles.mainFeedContainer}>
            <div className={styles.mainFeedContainerFilter}>
                <div className={styles.selections}>
                    <label onClick={() => setGlobalFilter("All Events")}>
                        All Available Events                    
                    </label>
                    <label onClick={() => setGlobalFilter("My Events")}>
                        My Events
                    </label>
                    <label onClick={() => setGlobalFilter("My Drafts")}>
                        My Drafts
                    </label>
                    <label className={styles.toggleWrapper}>
                        <input
                            type="checkbox"
                            checked={showPastEvents}
                            onChange={(e) => setShowPastEvents(e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                        <span className={styles.labelText}>
                            {showPastEvents ? "Showing past events" : "Hide past events"}
                        </span>
                    </label>
                </div>
                <div className={styles.sort}>
                    <select onChange={(e) => searchQuery(e.target.value)}>
                        <option
                            value="Soonest">
                            Soonest
                        </option>
                        <option
                            value="Latest">
                            Latest
                        </option>
                        <option
                            value="Most Liked"
                            >
                            Most Liked
                        </option>
                        <option
                            value="Recently Added"
                        >
                            Recently Added
                        </option>
                        <option
                            value="Most Attended"
                        >
                            Most Attended
                        </option>
                        <option 
                            value ="Nearest">
                            Nearest
                        </option>
                    </select>
                </div>
            </div>
        <div className={styles.mapContainer}>
                <MapContainer
                center={[41.0082, 28.9784]}
                zoom={13}
                style={{ height: "500px", width: "90%", marginBottom: "20px", borderRadius: "20px"}}
                >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MainFeedMap events={globalFilterFunction()?.filter((event)=> showPastEvents || event.status !== "ENDED") || []} coords={{ lat: lat ?? 41.0082, lng: lng ?? 28.9784 }} />
                {flyTo && <MapPanner coords={flyTo} />}
                </MapContainer>
        </div>
        <div className={styles.onGoingEventsContainer}>

                { loading ? (
                    <>                          
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                    </>

                ) : events && events.length > 0 ? (
                    globalFilterFunction()
                    ?.filter((event)=> showPastEvents || event.status !== "ENDED")
                    ?.map((event) => (
                        (
                            <div key={event.id} onClick={() => {event.isDraft ? navigate(`/update-event/${event.id}`) :  navigate(`/event/${event.id}`)}}>
                                <div className={event.status !== "ENDED" ? (
                                                isEventFull(event) ? `${styles.eventCard} ${styles.full}` : `${styles.eventCard}`
                                    ): (
                                        event.attendees.some(attendee => attendee.username === currentUser?.username) ? 
                                                `${styles.eventCard} ${styles.joinedEnded}` : 
                                                `${styles.eventCard} ${styles.ended}`
                                    )}>                                   
                                    {event.isPrivate && 
                                    <><FontAwesomeIcon
                                            icon={faLock}
                                            className={styles.lockIcon}
                                            data-tooltip-id="private_event_tooltip" data-tooltip-content="Private Event" />
                                            <Tooltip id="private_event_tooltip"/>
                                    </>}
                                    <div className={event.isDraft ? `${styles.eventStatusDraft}` :  `${styles.eventStatus} ${styles[event.status]}`}> {event.status}</div>
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
                                                <p > {new Date(event.startDate).toLocaleDateString("en-US", options)}
                                                {!isStartDateAndEndDateSame(event) &&
                                                    <> - {new Date(event.endDate).toLocaleDateString("en-US", options)}</>
                                                }
                                                <strong> &bull; </strong> {event.startTime} - {event.endTime}</p>
                                            </span>
                                        </div>
                                        <div className={styles.eventLocation}>
                                            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                                            <p>{event.addressName}</p>
                                            { lng === 0 || lat === 0 ? "" : <>
                                                <p>( {calculateDistance(event).toFixed(1)} km away )</p>
                                            </>
                                            }
                                        </div>
                                        <div className={styles.tags}>
                                            <ul>
                                                {event.tags?.slice(0, 2).map((tag, index) => (
                                                    <li key={index}>
                                                        <span>
                                                            #{tag} 
                                                        </span>
                                                        {index === 1 ? " ..." : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {event.organizer && (
                                                <div className={styles.eventOrganizer}>
                                                    <img src={event.organizer.profilePictureUrl} alt={event.organizer.profilePictureUrl} className="event-organizer-image" />
                                                    <p>{event.organizer.firstName} {event.organizer.lastName}</p>
                                                </div>
                                        )}
                                    </div>
                                    {event.status === "ENDED" && (
                                    <div className={styles.eventRatings}>
                                        <EventRatingStars eventId={event.id} />
                                        <div className={styles.averageRating}>
                                            {event.reviews.length > 0
                                                ? (
                                                    (
                                                        event.reviews.map(review => review.rating)
                                                        .reduce((acc, curr) => acc + curr, 0) / event.reviews.length
                                                    ).toFixed(1)
                                                )
                                                : "0.0"
                                            }
                                            <p>({event.reviews.length})</p>
                                        </div>
                                    </div>
                                    )}
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
                                {event.status !== "ENDED" && ( !(event.organizer?.username === currentUser?.username ||
                                    event.attendees.some(element => element.username === currentUser?.username)) && event.status !== 'FULL' )&&
                                    <button
                                        disabled={isDisabled(event)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoinEvent(event.id)}} 
                                        className={styles.joinButton}>
                                        {event.isPrivate ? (
                                            invitations.some(invitation => invitation.eventId === event.id) ? "You are already invited!"
                                            : (
                                                requestSentEvents.some(requestSentEvent => requestSentEvent.id === event.id) ? 
                                                "Request sent!" :  "Send Join Request!" )
                                        ): "Join" }
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
