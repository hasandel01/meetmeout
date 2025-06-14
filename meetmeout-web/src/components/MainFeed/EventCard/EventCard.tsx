import { useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faCalendar, faLocationDot, faLock} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import styles from "./EventCard.module.css";
import { Tooltip } from "react-tooltip";
import { Event } from "../../../types/Event";
import { User } from "../../../types/User";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import EventRatingStars from "../EventRatingStars/EventRatingStars";
import { calculateDistance } from "../../../utils/calculateDistance";
import { useState, useEffect } from "react";
import axiosInstance from "../../../axios/axios";
import qs from 'qs';
import { toast } from "react-toastify";
import { useBadgeContext } from "../../../context/BadgeContext";
import { useRef } from "react";

interface EventCardProps {
    event: Event;
    currentUser: User | null;
    isDisabled: (event: Event) => boolean;
    handleLike: (eventId: number) => void;
    invitations: { eventId: number }[];
    requestSentEvents: Event[];
    dateOptions: Intl.DateTimeFormatOptions;
    lat?: number;
    lng?: number;
}

const EventCard = ({
  event,
  currentUser,
  handleLike,
  invitations,
  requestSentEvents,
  dateOptions,
  lat,
lng
}: EventCardProps) => {

    const navigate = useNavigate();
    const distance = calculateDistance(event, lat, lng);
    const [requestSent, setRequestSent] = useState<boolean>(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictingEvents, setConflictingEvents] = useState<Event[]>([]);
    const {getMe} = useBadgeContext();

    useEffect(() => {
        const alreadySent = requestSentEvents.some(req => req.id === event.id);
        setRequestSent(alreadySent);
    }, [requestSentEvents, event.id]);

    const isEventFull =(event: Event):boolean =>  {
        return event.maximumCapacity <= event.attendees.length;
    } 

    const isStartDateAndEndDateSame = (event: Event): boolean => {
        return new Date(event.startDate).toLocaleDateString() === new Date(event.endDate).toLocaleDateString();
    };


    const handleNavigateInvitedEvent = async () => {

        if(!currentUser) return;

        try {
            const response = await axiosInstance.get(`/events/${event.id}/invitations/${currentUser.id}`)
            console.log(response)
            navigate(`/event/${event.id}?token=${response.data.token}`)
        } catch(error) {
            console.log(error)
        }
    }

    const modalRef = useRef<HTMLDivElement>(null);
    

    const handleJoinEvent = async (eventId: number) => {

        try {

            const response = await axiosInstance.get(`/events/with-ids`, {
                params: { ids: currentUser?.participatedEventIds },
                    paramsSerializer: (params) => {
                        return qs.stringify(params, { arrayFormat: 'repeat' });
                    }
                });        
        
            const userEvents: Event[] = response.data;
            
                const conflicts = userEvents.filter(e => {
                const eStart = new Date(`${e.startDate}T${e.startTime}`);
                const eEnd = new Date(`${e.endDate}T${e.endTime}`);
                const currentStart = new Date(`${event?.startDate}T${event?.startTime}`);
                const currentEnd = new Date(`${event?.endDate}T${event?.endTime}`);

                return eStart < currentEnd && eEnd > currentStart;
            });

            if (conflicts.length > 0) {
            setConflictingEvents(conflicts);
            setShowConflictModal(true);
            return;
            }

            await joinEventRequest(eventId);

        } catch(error) {
            toast.error("You couldn't join to the event.")
        }

    }

    const joinEventRequest = async (eventId: number) => {
        try {
            const response = await axiosInstance.post(`/events/${eventId}/join`);
            if (response.status === 200) {
            
                if(event.isPrivate) {
                    setRequestSent(true)
                } {
                    toast.success("You successfully joined the event!");
                    setTimeout(() => navigate(`/event/${eventId}`), 500);
                }
                
                await getMe();
            } else {
            toast.error("Couldn’t join the event.");
            }
        } catch (error) {
            toast.error("Couldn’t join the event.");
        }
    };

    return (
        <div className={event.status !== "ENDED" ? (
                                                isEventFull(event) ? `${styles.eventCard} ${styles.full}` : `${styles.eventCard}`
                                    ): (
                                        event.attendees.some(attendee => attendee.username === currentUser?.username) ? 
                                                `${styles.eventCard} ${styles.joinedEnded}` : 
                                                `${styles.eventCard} ${styles.ended}`
                                    )}
                                    onClick={showConflictModal || (event.isPrivate && !event.attendees.some(attendee => attendee.username === currentUser?.username) )
                                                ? undefined : () => navigate(`/event/${event.id}`)}>                                   
                                    {event.isPrivate && 
                                    <><FontAwesomeIcon
                                            icon={faLock}
                                            className={styles.lockIcon}
                                            data-tooltip-id="private_event_tooltip" data-tooltip-content="Private Event" />
                                            <Tooltip id="private_event_tooltip"/>
                                    </>}
                                    <div className={event.isDraft ? `${styles.eventStatusDraft}` :  `${styles.eventStatus} ${styles[event.status]}`}>
                                        {!event.isDraft && event.status} </div>
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
                                    <p className={styles.eventDescription}>{event.description}</p>
                                    <div className={styles.eventDetailsInfo}>
                                        <div className={styles.eventTimeDate}>
                                            <span>
                                                <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                                                <p > {new Date(event.startDate).toLocaleDateString("en-US", dateOptions)}
                                                {!isStartDateAndEndDateSame(event) &&
                                                    <> - {new Date(event.endDate).toLocaleDateString("en-US", dateOptions)}</>
                                                }
                                                <strong> &bull; </strong> {event.startTime} - {event.endTime}</p>
                                            </span>
                                        </div>
                                        <div className={styles.eventLocation}>
                                            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                                            <p>{event.addressName}</p>
                                            { lng === 0 || lat === 0 ? "" : <>
                                                <p>( {distance.toFixed(1)} km away )</p>
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
                                    {!event.isPrivate &&
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
                                                    handleLike(event.id);
                                                }}
                                                />
                                                <Tooltip id="event_like"/>
                                            <p>{event.likes.length > 0 ? `${event.likes.length}` : ""}</p>
                                        </div>
                                        <div className={styles.buttonGroup}>
                                            <FontAwesomeIcon 
                                                onClick={ (e) => {
                                                    e.stopPropagation();
                                                    navigate(`/event/${event.id}#eventComments`)
                                                }}
                                                icon={faComment} 
                                                className={styles.commentIcon} />
                                            <p>{event.comments.length > 0 ? `${event.comments.length}` : ""}</p>
                                        </div>
                                    </div>
                                    } 
                                {event.status !== "ENDED" && ( !(event.organizer?.username === currentUser?.username ||
                                    event.attendees.some(element => element.username === currentUser?.username)) && event.status !== 'FULL' )&&
                                    <button
                                        disabled={requestSent}
                                        onClick={
                                            (e) => {
                                            e.stopPropagation();

                                            event.isPrivate &&
                                                    invitations.some(invitation => invitation.eventId === event.id) ?
                                                    (
                                                        handleNavigateInvitedEvent()                                              
                                                    )
                                                    : (
                                                         handleJoinEvent(event.id)
                                                    )

                                        }} 
                                        className={event.isPrivate && invitations.some(invitation => invitation.eventId === event.id) ? 
                                             styles.alreadyInvited : styles.joinButton}>
                                        {event.isPrivate ? (
                                            invitations.some(invitation => invitation.eventId === event.id) ? "You are invited!"
                                            : (
                                                requestSent ? 
                                                "Request sent!" :  "Send Join Request!" )
                                        ): "Join" }
                                    </button> }

        {showConflictModal && conflictingEvents.length > 0 && (
                                    <div className={styles.deleteEventModalOverlay}>
                                        <div className={styles.deleteEventModal} ref={modalRef}>
                                        <h4>⚠️ You have overlapping events!</h4>
                                        <p>The following events conflict with this one:</p>
                                        <ul>
                                            {conflictingEvents.map(evt => (
                                            <li key={evt.id}>
                                                <strong>{evt.title}</strong><br/>
                                                {evt.startDate} {evt.startTime} → {evt.endDate} {evt.endTime}
                                            </li>
                                            ))}
                                        </ul>
                                        <div className={styles.deleteEventModalButtons}>
                                            <button
                                            className={styles.confirmButton}
                                            onClick={async () => {
                                                setShowConflictModal(false);
                                                await joinEventRequest(event.id);
                                            }}
                                            >
                                            Join Anyway
                                            </button>
                                            <button
                                            className={styles.cancelButton}
                                            onClick={() => setShowConflictModal(false)}
                                            >
                                            Cancel
                                            </button>
                                        </div>
                                        </div>
                                    </div>
                                    )}                                        
        </div>
    )       
}


export default EventCard;