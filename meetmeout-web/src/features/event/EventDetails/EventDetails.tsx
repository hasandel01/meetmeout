import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";
import { Event } from "../../../types/Event";
import axios from "axios";
import {toast} from 'react-toastify';
import { Forecast } from "../../../types/Forecast";
import {User} from '../../../types/User';
import styles from './EventDetails.module.css'
import { faCalendar, faLocationDot} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";

const EventDetails = () => {

  const eventId = useParams<({eventId: string})>()
  const apiKey = "e15b0131b777a9e6ecf78e940f939984";
  const eventIdNumber = parseInt(eventId?.eventId || "0", 10);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const navigate = useNavigate();
    const [event, setEvent] = useState<Event>({
        id: 1,
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
    const [weather, setWeather] = useState<Forecast | null>(null);


    useEffect(() => {
      getEvent();
      getWeather();
      getMe();
    },[]);


  const getEvent = async () => {

    try {

        const response = await axiosInstance.get(`/get-event/${eventIdNumber}`);
        setEvent(response.data);
        console.log(response.data)
    } catch(error) {

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

  const getWeather = async () => {

    try {

      const response = await 
        axios
        .get(`https://api.openweathermap.org/data/2.5/forecast?lat=${event.latitude}&lon=${event.longitude}&appid=${apiKey}&units=metric`, {
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

          const response = await axiosInstance.post(`/leave-event/${eventId.eventId}`);
          navigate("/main-feed")
    } catch(error) {

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

  const likeEvent = async () => {

    try {
        const response = await axiosInstance.post(`/like-event/${eventId.eventId}`);

    } catch(error) {

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
                                    <button className="heart-button" onClick={likeEvent}>
                                        <FontAwesomeIcon icon={faHeart} className="heart-icon" />
                                    </button>
                                    <p>{event.likes?.length}</p>
                                    <button className="comment-button">
                                        <FontAwesomeIcon icon={faComment} className="comment-icon" />
                                    </button>
                                    <p>{event.comments?.length}</p>
                                     <button disabled={isDisabled(event)}
                                            onClick={() => handleJoinEvent(event.id)} 
                                            className={styles.joinButton}>
                                            Join Event 
                                    </button>
                      </div>
              </div>
              <div className={styles.weatherApi}>
                  <img src="./logo_cut.png"></img>
                  <p>{weather?.city.coord.lat}</p>
            </div>
      </div>
      <button onClick={handleLeaveEvent}>{(event.organizer?.username === currentUser?.username) ? "Delete Event" : "Leave Event" }</button>
    </div>
  );
}


export default EventDetails;