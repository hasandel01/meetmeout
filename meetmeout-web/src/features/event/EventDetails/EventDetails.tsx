import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";
import { Event } from "../../../types/Event";
import axios from "axios";
import {toast} from 'react-toastify';
import { Forecast } from "../../../types/Forecast";
import {User} from '../../../types/User';

const EventDetails = () => {

  const eventId = useParams<({eventId: string})>()
  const apiKey = "e15b0131b777a9e6ecf78e940f939984";
  const eventIdNumber = parseInt(eventId?.eventId || "0", 10);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
        latitude: 0
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

  return (
    <div>
      <button onClick={handleLeaveEvent}>{(event.organizer?.username === currentUser?.username) ? "Delete Event" : "Leave Event" }</button>
      <h3>{event.title}</h3>
        <p>{event.description}</p>
        <p>{event.tags.at(0)}</p>
        <p>{weather?.city.coord.lat}</p>
      
    </div>
  );
}


export default EventDetails;