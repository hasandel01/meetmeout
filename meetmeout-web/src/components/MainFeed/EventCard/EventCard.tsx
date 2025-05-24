import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faCalendar, faLocationDot, faLock} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import styles from "./../MainFeed.module.css";
import { Tooltip } from "react-tooltip";
import { Event } from "../../../types/Event";
import { User } from "../../../types/User";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import EventRatingStars from "../EventRatingStars/EventRatingStars";

interface EventCardProps {
    event: Event;
    currentUser: User | null;
    isDisabled: (event: Event) => boolean;
    handleJoinEvent: (eventId: number) => void;
    handleLike: (eventId: number) => void;
    invitations: { eventId: number }[];
    requestSentEvents: Event[];
    calculateDistance: (event: Event) => number;
    dateOptions: Intl.DateTimeFormatOptions;
    lat?: number;
    lng?: number;
}

    const isEventFull =(event: Event):boolean =>  {
        return event.maximumCapacity <= event.attendees.length;
    } 

    const isStartDateAndEndDateSame = (event: Event): boolean => {
        return new Date(event.startDate).toLocaleDateString() === new Date(event.endDate).toLocaleDateString();
    };

    

const EventCard = ({
  event,
  currentUser,
  isDisabled,
  handleJoinEvent,
  handleLike,
  invitations,
  requestSentEvents,
  calculateDistance,
  dateOptions,
  lat,
lng
}: EventCardProps) => {

      const navigate = useNavigate();

    return (
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
                                                handleLike(event.id);
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
}


export default EventCard;