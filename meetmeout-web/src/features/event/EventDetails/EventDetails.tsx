import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState, useRef } from "react";
import { Event } from "../../../types/Event";
import {toast} from 'react-toastify';
import {User} from '../../../types/User';
import styles from './EventDetails.module.css'
import { faCalendar, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import SockJS from 'sockjs-client/dist/sockjs'; 
import { Client} from "@stomp/stompjs";
import { Message } from "../../../types/Message";
import { JoinRequest } from "../../../types/JoinRequest";

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

      /*
      const response = await 
        axios
        .get(`https://api.openweathermap.org/data/3.0/onecall?lat=${event.latitude}&lon=${event.longitude}&exclude=minutely,hourly&appid=${apiKey}&units=metric`, {
        });
        
        console.log(response.data);
        setWeather(response.data);
        */
          
    }catch(error) {
      toast.error("Error getting weather info");
      console.log((error as any).message);
    }

  }

  const handleLeaveEvent = async () => {
    try {

          await axiosInstance.post(`/leave-event/${eventId.eventId}`);
          navigate("/main-feed")
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
      await axiosInstance.post(`/add-comment/${eventId}`,
        {
            commentId: null,
            comment: commentString,
            userId: currentUser?.id,
            username: currentUser?.username,
            eventId: eventId,
            updatedAt: new Date().toISOString()
        }

      )
    
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
    const socket = new SockJS(`192.168.1.42:8081/ws?token=${token}`)
  
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
              console.log(response.data)
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
       <div className={styles.eventCardAndWeatherAPI}>
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
                                     <button disabled={isDisabled(event)}
                                            onClick={() => handleJoinEvent(event.id)} 
                                            className={styles.joinButton}>
                                            Join Event 
                                    </button>
                                </div>
                                <div className={styles.commentContainer}>
                                    <ul> 
                                        {event.comments
                                        .map((comment,index) => (
                                            <li key={index}>
                                                <div>
                                                    <h4> {comment.username} </h4>
                                                    <p> {comment.comment} </p>
                                                    <h5> {comment.updatedAt}</h5>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className={styles.addComment}>
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentString}
                                            onChange={(e) => setCommentString(e.target.value)}
                                        ></input>
                                        <button onClick={() => handleAddComment(event.id)}>
                                           Send comment
                                        </button>
                                    </div>
                                </div>
                    </div>
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
                              Send Message
                            </button>
                      </div>
        </div>
      <div className={styles.attendees} >
        <h4>Attendees</h4>
        <hr/>
            <ul>
               {event.attendees.map((attendee,index) => 
                <li key={index} onClick={() => goToUserProfile(attendee.username)}>
                      <img src={attendee.profilePictureUrl}></img>
                      <h5>{attendee.firstName}</h5>
                </li>
                )}
            </ul>
      </div>
      <div className={styles.attendees} >
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
      <button onClick={handleLeaveEvent}>{(event.organizer?.username === currentUser?.username) ? "Delete Event" : "Leave Event" }</button>
    </div>
  );
}


export default EventDetails;