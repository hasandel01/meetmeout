import Calendar from "react-calendar";
import axiosInstance from "../../axios/axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Event } from "../../types/Event";
import { format } from 'date-fns';
import styles from "./MyCalendar.module.css";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';


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


    const formattedEvents = events?.map(ev => ({
        title: ev.title,
        start: `${ev.date}T${ev.startTime}`,
        end: `${ev.date}T${ev.endTime}`,
        extendedProps: {
            imageUrl: ev.imageUrl
        },
    })) || [];

    return (
        <div>
            <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            events={formattedEvents}
            height="auto"
            >
            </FullCalendar>
        </div>
    )
} 

export default MyCalendar;