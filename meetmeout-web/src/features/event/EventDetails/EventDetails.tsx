import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";
import { Event } from "../../../types/Event";
import {toast} from 'react-toastify';
import {User} from '../../../types/User';
import styles from './EventDetails.module.css'
import { faCalendar, faLocationDot, faRightFromBracket, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { JoinRequest } from "../../../types/JoinRequest";
import { Tooltip } from "react-tooltip";
import formatTime from "../../../utils/formatTime";
import { useUserContext } from "../../../context/UserContext";
import axios from "axios";
import { Weather } from "../../../types/Forecast";
import AttendeeContainerModal from "./AttendeeContainerModal/AttendeeContainerModal";
import RequesterContainerModal from "./RequesterContainerModal/RequesterContainerModal";
import { useProfileContext } from "../../../context/ProfileContext";
import Chat from "./Chat/Chat";

const EventDetails = () => {

  const {currentUser} = useUserContext();
  const [searchParams] = useSearchParams();
  const [isUserAllowed, setIsUserAllowed] = useState(false);
  const token = searchParams.get("token");
  const eventId = useParams<({eventId: string})>()
  const apiKey = "8bab3141ded8b5cedd3745f6991755d4";
  const eventIdNumber = parseInt(eventId?.eventId || "0", 10);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const navigate = useNavigate();
  const [commentString, setCommentString] = useState('');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [companions, setCompanions] = useState<User[]>([]);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const {goToUserProfile} = useProfileContext();


    const [event, setEvent] = useState<Event>({
        id: 0,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: "",
        tags: [],
        isPrivate: false,
        isDraft: false,
        maximumCapacity: 1,
        status: 'ONGOING',
        attendees: [],
        organizer: null,
        addressName: '',
        category: '',
        longitude: 0,
        latitude: 0,
        likes: [],
        comments: [],
        reviews: [],
        createdAt: ''
    });
    
    const [weather, setWeather] = useState<Weather | null>(null);


    useEffect(() => {
      if (eventIdNumber > 0) {
        verifyTokenToAccessDetails();
        getEvent();
      }
    }, [eventIdNumber]);

    useEffect(() => {
      if(event.latitude && event.longitude) {
        getWeather();
      }
    },[event.latitude, event.longitude]);


  const getEvent = async () => {

    try {
        const response = await axiosInstance.get(`/get-event/${eventIdNumber}`);
        setEvent(response.data);
    } catch(error) {
      toast.error("Error fetching event data.");
    }
  }

    const getCompanions = async () => {
            try {
                const response = await axiosInstance.get(`/${currentUser?.username}/companions`);
                console.log("Companion profile fetched successfully:", response.data);
                setCompanions(response.data);
            }
            catch (error) {
                console.error("Error fetching companion profile:", error);
            }
  };

  const getWeather = async () => {

    try {

    

      const response = await 
        axios
        .get(`https://api.openweathermap.org/data/3.0/onecall?lat=${event.latitude}&lon=${event.longitude}&exclude=minutely,hourly&appid=${apiKey}&units=metric`, {
        });

        console.log(response.data);
        setWeather(response.data);
    

    }catch(error) {
      toast.error("Error getting weather info");
      console.log((error as any).message);
    }

  }

  const handleLeaveEvent = async () => {
    try {

    await axiosInstance.post(`/leave-event/${eventId.eventId}`);
    navigate("/")


    } catch(error) {
        toast.error("Error leaving event.")
    }
  }

  const verifyTokenToAccessDetails = async () => {

    try {
      await axiosInstance.post(`/verify-access-to-event/${eventIdNumber}`, {
        token: token
        });
      setIsUserAllowed(true);
    } catch(error) {
      toast.error("Error verifying token")
      navigate("/")
    }
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

  const isDisabled = (event: Event) => {
    return event.attendees.some(element => element.username === currentUser?.username)
  }


    const handleLike = async () => {
      if (!currentUser) return;

      const alreadyLiked = event.likes.some(like => like.username === currentUser.username);

      // Optimistic UI update
      const updatedLikes = alreadyLiked
        ? event.likes.filter(like => like.username !== currentUser.username)
        : [...event.likes, {
            id: 0, 
            username: currentUser.username,
            eventId: event.id
          }];

      setEvent(prev => ({
        ...prev,
        likes: updatedLikes
      }));

      try {
        await axiosInstance.post(`/like-event/${event.id}`);
      } catch (error) {

        const rolledBackLikes = alreadyLiked
          ? [...event.likes, {
              id: 0,
              username: currentUser.username,
              eventId: event.id
            }]
          : event.likes.filter(like => like.username !== currentUser.username);

        setEvent(prev => ({
          ...prev,
          likes: rolledBackLikes
        }));

        toast.error("Like işlemi başarısız oldu");
      }
    };


  const handleAddComment = async (eventId: number) => {

    try {
        const newComment = {
          commentId: null,
          comment: commentString,
          userId: currentUser?.id,
          username: currentUser?.username,
          eventId: eventId,
          updatedAt: new Date().toISOString()
        };

      await axiosInstance.post(`/add-comment/${eventId}`, newComment)
    
      setEvent(prev => ({
        ...prev,
        comments: [...prev.comments, {
          commentId: Math.random(),
          eventId: prev.id,
          comment: newComment.comment,
          updatedAt: newComment.updatedAt,
          sender: currentUser!
        }]
      }));

      toast.success("Comment is sent!")
    } catch(error) {
      toast.error("Error sending a comment.")
    }
  }

  
  const showUsersToInvite = () => {
    setShowInviteModal(prev => !prev)
    
  }
 

  useEffect(() => {
  if (event.id !== 0) {
    getAllJoinRequests(event.id);
    getCompanions();
  }
}, [event.id]);


  const getAllJoinRequests = async (eventId: number) => {

    try {
        const response = await axiosInstance.get(`/get-join-requests/${eventId}`)
              setJoinRequests(response.data)
     } catch(error) {
      toast.error("Error getting requesters!")
     }

  }


  const handleAcceptJoinRequest = async (eventId: number, username: string) => {
    try {
        await axiosInstance.post(`/accept-join-request/${eventId}/${username}`)
    } catch(error)  {
      toast.error("Error accepting join request!")
    }
  }

  const sendInvitationLink = async (eventId: number) => {
     try {
      await axiosInstance.post(`/send-invitation/${eventId}`, invitedUsers);
        toast.success(invitedUsers.length === 1 ? "Invitation is sent" : "Invitations are sent")
     } catch(error) {
        toast.error("Error while sending invitation.")
     }
  }

  const isMoreThan8DaysLater = (eventDateStr : string): boolean => {

    const today= new Date();
    const eventDate = new Date(eventDateStr);

    const diffInTime = eventDate.getTime() - today.getTime();
    const diffInDays = diffInTime / (1000 * 60 * 60 *24);

    return diffInDays > 7;

  } 

  const returnDayDifference = ():number => {

    const today = new Date();
    const eventDate = new Date(event.date);

    const diffInMs = eventDate.getDate() - today.getDate();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    return diffInDays;
  }


  return (
    <div className={styles.eventContainer}>
      {isUserAllowed ? (
        <>
          <div className={styles.attendees} >
                  <h4>Attendees</h4>
                      <ul>
                        {event.attendees.slice(0,4).map((attendee,index) => 
                          <li key={index} onClick={() => goToUserProfile(attendee.username)}>
                                {event.organizer?.username === attendee.username &&
                                <>
                                  <FontAwesomeIcon icon={faStar} className={styles.organizerIcon}
                                  data-tooltip-id="organizer-icon" data-tooltip-content="Organizer"></FontAwesomeIcon>
                                  <Tooltip id="organizer-icon"/>
                                </>
                                  }
                                <img src={attendee.profilePictureUrl}></img>
                                <h5>{attendee.firstName}</h5>
                          </li>
                          )}
                          {event.attendees.length > 4 &&
                            <div className={styles.andMoreAvatar}
                                onClick={() => setShowAllAttendees(true)}>
                              <strong> + {event.attendees.length - 4} </strong>
                            </div>
                          }
                      </ul>
                      {showAllAttendees && <AttendeeContainerModal attendees={event.attendees} onClose={() => setShowAllAttendees(false)}></AttendeeContainerModal>}
                      {event.organizer?.username === currentUser?.username &&
                      <>
                      <h4>Requesters</h4>
                            <ul>
                              {joinRequests.slice(0.4).map((request, index) => 
                                  <li key={index} onClick={() => goToUserProfile(request.user.username)}>
                                    <img src={request.user.profilePictureUrl} />
                                    <h5>{request.user.firstName}</h5>
                                    <button onClick={() => handleAcceptJoinRequest(event.id, request.user.username)}>
                                      Accept
                                    </button>
                                  </li>
                              )}
                              {joinRequests.length > 4 && 
                              <div className={styles.andMoreAvatar}
                                   onClick={() => setShowAllRequests(true)}
                                >
                                  <strong>+ {joinRequests.length - 4} more</strong>
                              </div>}
                        </ul>
                        {showAllRequests && 
                        <RequesterContainerModal requests={joinRequests} 
                                                onClose={() => setShowAllRequests(false)}></RequesterContainerModal>}
                        </>
                      }                      
                </div>
                <div className={styles.eventCardAndComment}>
                  <div className={styles.eventCardAndWeatherAPI}>
                    <div className={styles.eventCard}> 
                        <div className={styles.firstColumn}>
                            <img src={event.imageUrl} alt={event.title} />
                            {weather && weather.current && (
                                    <div className={styles.weatherWidget}>
                                    <h4>How is the weather on the day of the event?</h4>
                                      <div className={styles.weatherContent}>
                                        {!isMoreThan8DaysLater(event.date) ? (
                                          <div className={styles.weatherInfo}>
                                            <img
                                                  src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`} 
                                                  alt={weather.daily.at(returnDayDifference())?.summary}
                                            ></img>
                                            <div>
                                                  <p>{weather.daily.at(returnDayDifference())?.temp.max.toFixed(0)}</p>
                                                  <p>{weather.daily.at(returnDayDifference())?.temp.min.toFixed(0)}</p>
                                            </div>
                                            <p>{weather.daily.at(returnDayDifference())?.summary}</p>
                                          </div>
                                        ) : (
                                          <div>
                                              We can't provide you weather forecast for this time period. Weather forecast will be shown 8 days before the event date.
                                            </div>
                                        )}

                                      </div>
                                    </div>
                                  )}
                        </div>
                        <div className={styles.secondColumn}>
                              <div className={`${styles.eventStatus} ${styles[event.status]}`}> {event.status}</div>
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
                                      {event.tags.map((tag, index) => (
                                        <span key={index} className={styles.tag}>
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                </div>         
                              </div>
                              <div className={styles.eventActions}>
                                              <div className={styles.buttonGroup}>
                                                  <FontAwesomeIcon 
                                                      icon={
                                                          event.likes.some(u => u.username === currentUser?.username)
                                                          ? faHeart
                                                          : regularHeart} 
                                                      className={styles.heartIcon}
                                                      onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleLike()
                                                      }}/>
                                                  <span>{event.likes.length > 0 ? `${event.likes.length}` : ""}</span>
                                              </div>
                                              <div className={styles.buttonGroup}>
                                                  <FontAwesomeIcon 
                                                      icon={faComment} 
                                                      className={styles.commentIcon} />
                                                  <span>{event.comments.length > 0 ? `${event.comments.length}` : ""}</span>
                                              </div>
                                          </div>                     
                                            
                                            {event.attendees.some(attendee => attendee.username == currentUser?.username) ?
                                            (
                                            <div className={styles.secondButtonGroup}>
                                              <button className={styles.inviteButton} onClick={(e) => {
                                                e.stopPropagation()
                                                showUsersToInvite()
                                              }}>
                                                  Send Invite
                                              </button>
                                              {showInviteModal && 
                                              <div className={styles.inviteModalContainer}>
                                                  <ul> 
                                                    {companions
                                                    .filter( companion => !(
                                                          event.attendees.some(attendee => attendee.username === companion.username) || 
                                                          joinRequests.some(joinRequest => joinRequest.user.username === companion.username)  
                                                        ))
                                                    .map( (companion, index) => (
                                                      <li key={index} className={invitedUsers.some(invitedUser => invitedUser === companion) ? styles.liSelected : ""}
                                                                    onClick={() => {
                                                                          if(!invitedUsers.some(invitedUser => invitedUser === companion))
                                                                              setInvitedUsers((prev) => [...prev, companion])  
                                                                          else 
                                                                              setInvitedUsers((prev) => prev.filter(user => user.username !== companion.username))
                                                                    }} >
                                                            <img src={companion.profilePictureUrl}></img>
                                                            <h4>{companion.firstName} {companion.lastName}</h4>
                                                            <button onClick={() => sendInvitationLink(event.id)}>Send</button>
                                                      </li>
                                                    ))}
                                                  </ul>
                                              </div>
                                              }
                                              <button className={styles.deleteButton} onClick={(e) => {
                                                e.stopPropagation();
                                                handleLeaveEvent()
                                                }}>
                                              {(event.organizer?.username === currentUser?.username )? (
                                                  <>
                                                  <FontAwesomeIcon icon={faTrash} size="2x" />
                                                  <label> Delete Event </label>
                                                  </>
                                                  )
                                                  : ( 
                                                  <>
                                                    <FontAwesomeIcon icon={faRightFromBracket} size="2x" />
                                                    <label> Leave Event </label>
                                                  </>
                                                  ) }
                                                  </button>
                                              </div>
                                                ) : (
                                                <button disabled={isDisabled(event)}
                                                  onClick={() => handleJoinEvent(event.id)} 
                                                  className={styles.joinButton}>
                                                  Join Event 
                                                </button> 

                                            )}
                              </div>
                        </div>
                        <div className={styles.commentContainer}>
                                <div className={styles.commentContainerAlt}>
                                                  <ul> 
                                                  {event.comments
                                                  .sort((a,b) => {
                                                    const timeA = new Date(a.updatedAt)
                                                    const timeB = new Date(b.updatedAt);
                                                    return timeA.getTime() - timeB.getTime()
                                                  })
                                                  .map((comment,index) => (
                                                      <li key={index}>
                                                              <div className={styles.commentElement}>
                                                                <div className={styles.commentSender}>
                                                                    <img src={comment.sender.profilePictureUrl}></img>
                                                                    <h5> {comment.sender.username} </h5>
                                                                </div>
                                                              <span className={styles.timestamp}>{formatTime(comment.updatedAt)}</span>
                                                              </div>
                                                              <strong> {comment.comment} </strong>
                                                      </li>
                                                  ))}
                                              </ul>
                                              <hr/>
                                              <div className={styles.addComment}>
                                                  <input
                                                      type="text"
                                                      placeholder="Add a comment..."
                                                      value={commentString}
                                                      onChange={(e) => setCommentString(e.target.value)}
                                                  ></input>
                                                  <button onClick={() => handleAddComment(event.id)}>
                                                    Send
                                                  </button>
                                              </div>
                                  </div>
                          </div>
                </div>
                <Chat eventId={event.id}></Chat>   
        </> 
      )
      : (
        <div>
            <strong>YOU ARE NOT ALLOWED TO SEE THIS PAGE!</strong>
          </div>
      )
      
      }
    </div>
  );
}


export default EventDetails;