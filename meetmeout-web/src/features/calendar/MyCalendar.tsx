import Calendar from "react-calendar";
import axiosInstance from "../../axios/axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Event } from "../../types/Event";
import { format } from 'date-fns';
import styles from "./MyCalendar.module.css";

const MyCalendar = () => {

    const [events, setEvents] = useState<Event[] | null>([]);

    const getMyEvents = async () => {
        return axiosInstance.get("/get-my-events")
        .then(res => setEvents(res.data))
        .catch(() => toast.error("Error getting events."));
    };

    useEffect(() => {
        getMyEvents()
    },[])

    return (
        <div>
            <Calendar
                tileContent={({date}) => {
                    const event = events?.find(ev => ev?.date === format(date, "yyyy-MM-dd"));
                    return event ? 
                    <div className={styles.eventOnCalendarContainer}>
                        <img src={event.imageUrl} alt="event-image"></img>
                        <p>{event.title}</p>
                        <p>{event.startTime} {event.endTime}</p>
                    </div> : null;
                }}
            ></Calendar>
        </div>
    )
} 

export default MyCalendar;