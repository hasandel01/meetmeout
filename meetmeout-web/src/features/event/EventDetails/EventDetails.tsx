import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState, useRef } from "react";
import { Event } from "../../../types/Event";
import {toast} from 'react-toastify';
import {User} from '../../../types/User';
import styles from './EventDetails.module.css'
import { faCalendar, faLocationDot, faRightFromBracket, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import SockJS from 'sockjs-client';
import { Client} from "@stomp/stompjs";
import { Message } from "../../../types/Message";
import { JoinRequest } from "../../../types/JoinRequest";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import formatTime from "../../../utils/formatTime";

const EventDetails = () => {

  const eventId = useParams<({eventId: string})>()
  const apiKey = "8bab3141ded8b5cedd3745f6991755d4";
  const eventIdNumber = parseInt(eventId?.eventId || "0", 10);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const navigate = useNavigate();
  const [commentString, setCommentString] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<Message>();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  const clientRef = useRef<Client | null>(null);

    const [event, setEvent] = useState<Event>({
        id: 0,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: "https://res.cloudinary.com/droju2iga/image/upload/v1745237659/default_event_artbhy.png",
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
        reviews: []
    });
    
    const [weather, setWeather] = useState<any | null>(null);


    useEffect(() => {
      getEvent();
      getMe();

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


  const getMe = async () => {
    
    try {
        const response = await axiosInstance.get("/me");
        setCurrentUser(response.data);
    } catch(error) {
        toast.error("Error fetching user data.");
    }
  }

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

    try {
        const response = await axiosInstance.post(`/like-event/${eventId.eventId}`);
          setMessages(prev => [...prev, response.data])
    } catch(error) {
      toast.error("Error liking the event.")
    }

  }

  const goToUserProfile = (username: string) => {
    try {
        navigate(`/user-profile/${username}`);
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
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


  const sendMessage = () => {
  
    if (!clientRef.current || !clientRef.current.connected) {
      return;
    }

    
    clientRef.current.publish({
      destination: `/app/chat/event/${event.id}`,
      body: JSON.stringify(newMessage)
    });

    
  };


  const getMessagesForEvent = async () => {


    try {
      const response = await axiosInstance.get(`/get-chat-messages/${event.id}`)
        setMessages(prev => [...prev, ...response.data]);
        toast.success("Event messages are in hand!")
    } catch(error) {
      toast.error("Error getting event messages")
    }

  }
  

  useEffect(() => {

    const token = localStorage.getItem("accessToken");
        const baseUrl = import.meta.env.VITE_SOCKET_BASE_URL
        const socket = new SockJS(`${baseUrl}/ws?token=${token}`);
          
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
  
          toast.info("Connected to the WebSocketServer!");

          client.subscribe(`/topic/chat/event/${event.id}` , (msg) => {
            try{
              const newMessage = JSON.parse(msg.body)
              console.log(newMessage)
              setMessages (prev => [...prev, newMessage]);
            } catch(error){
              console.error(error);
            }
          })  
      },
  
    })  
    
    clientRef.current = client;
    client.activate();



    return () => {
      client.deactivate();
    }


  }, [event.id])


  useEffect(() => {
  if (event.id !== 0) {
    getMessagesForEvent();
    getAllJoinRequests(event.id);
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

  return (
    <div className={styles.eventContainer}>
      <div className={styles.attendees} >
        <h4>Attendees</h4>
        <hr/>
            <ul>
               {event.attendees.map((attendee,index) => 
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
            </ul>
            <h4>Requesters</h4>
                <hr/>
                  <ul>
                    {joinRequests.map((request, index) => 
                      request.user ? (
                        <li key={index} onClick={() => goToUserProfile(request.user.username)}>
                          <img src={request.user.profilePictureUrl} />
                          <h5>{request.user.firstName}</h5>
                          <button onClick={() => handleAcceptJoinRequest(event.id, request.user.username)}>
                            Accept
                          </button>
                        </li>
                  ) : null
                )}
              </ul>
      </div>
      <div className={styles.eventCardAndComment}>
       <div className={styles.eventCardAndWeatherAPI}>
          <div className={styles.eventCard}> 
              <div className={styles.firstColumn}>
                  <img src={event.imageUrl} alt={event.title} />
                  {weather && weather.current && (
                          <div className={styles.weatherWidget}>
                          <h4>Current Weather</h4>
                            <div className={styles.weatherContent}>
                                <img
                                      src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`} 
                                      alt={weather.current.weather[0].description}
                                ></img>
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
                                  (<button className={styles.deleteButton} onClick={(e) => {
                                    e.stopPropagation();
                                    handleLeaveEvent
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
                                      </button>) : (
                                      <button disabled={isDisabled(event)}
                                        onClick={() => handleJoinEvent(event.id)} 
                                        className={styles.joinButton}>
                                        Join Event 
                                      </button>  )}
                    </div>
              </div>
              <div className={styles.commentContainer}>
                      <div className={styles.commentContainerAlt}>
                                        <ul> 
                                        {event.comments
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
      <div className={styles.chatContainer}>
                        <h4>Event Chat</h4>
                              <ul className={styles.messageList}>
                                {messages.map( (message, index) => (
                                  <li key={index} className={styles.chatMessage}>
                                      <img src={message.user.profilePictureUrl}></img>
                                      <h5>{message.message}</h5>
                                  </li>
                                ))}
                              </ul>
                          
                          <div className={styles.sendChatMessageContainer}>
                            <hr/>
                              <div className={styles.sendChatMessage}>
                              <input
                                  type="text"
                                  placeholder="Enter a message"
                                  value={newMessage?.message}
                                  onChange={(e) => {
                                      if (currentUser) {
                                          setNewMessage({ user: currentUser, message: e.target.value });
                                      }
                                  }}
                                  required
                                  >
                                </input>
                                <button onClick={sendMessage}>
                                    Send
                                  </button>
                                </div>
                          </div>
                           
    </div>      
    </div>
  );
}


export default EventDetails;