import axiosInstance from "../../axios/axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Event } from "../../types/Event";
import styles from "./MyCalendar.module.css";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";


const getColorBasedOnCategory = (color: string): string => {
    switch(color) {
        case "OUTDOOR_NATURE": 
            return "#4CAF50";
        case "LIVE_MUSIC":
            return "#BA68C8";
        case "WELLNESS":
            return "#81C784";
        case "SPORTS":
            return "#03A9F4";
        case "SOCIAL":
            return "#F06292";
        case "FOOD_DRINK":
            return "#FF7043";
        case "ART_CULTURE":
            return "#9575CD";
        case "WORKSHOP":
            return "#64B5F6";
        case "GAMES":
            return "#FFD54F";
        case "NETWORKING":
            return "#7986CB";
        case "FAMILY":
            return "#FFB74D";
        case "ADVENTURE":
            return "#A1887F";
        default: return "#90A4AE";
    }
}

const MyCalendar = () => {

    const [events, setEvents] = useState<Event[] | null>([]);

    const getMyEvents = async () => {
        return axiosInstance.get("/events/mine")
        .then(res => setEvents(res.data))
        .catch(() => toast.error("Error getting events."));
    };

    const navigate = useNavigate();

    useEffect(() => {
        getMyEvents()
    },[])

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const isStartDateAndEndDateSame = (event: Event): boolean => {
        return new Date(event.startDate).toLocaleDateString() === new Date(event.endDate).toLocaleDateString();
    };

    const handleLocationClick = (event: Event) => {
        navigate("/", {
        state: {
            flyTo: {
                lat: event.latitude,
                lng: event.longitude,
            }
        }
        })
    }


    const formattedEvents = events?.map(ev => ({
        title: ev.title,
        start: `${ev.startDate}T${ev.startTime}`,
        end: `${ev.endDate}T${ev.endTime}`,
        backgroundColor: getColorBasedOnCategory(ev.category),
        extendedProps: {
            event: ev,
            eventId: ev.id,
            imageUrl: ev.imageUrl,
            addressName: ev.addressName,
            endAddressName: ev.endAddressName,
            tags: ev.tags,
            startDate: ev.startDate,
            endDate: ev.endDate,
            startTime: ev.startTime,
            endTime: ev.endTime      
        },
    })) || [];

    return (
        <div className={styles.eventOnCalendarContainer}>
            <div>
                <h4>📌 Here is your calendar. You can keep track of your events! 🗓️</h4>
            </div>
            <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:30:00"
            slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }}
            allDaySlot={false}
            events={formattedEvents}
            height="90vh"
            eventContent={(arg) => (
                <div className={styles.eventItem} onClick={() => navigate(`/event/${arg.event.extendedProps.eventId}`)}>
                    <span className={styles.eventTitle}>{arg.event.title}</span>
                    <div className={styles.eventLocation} onClick={(e) => {
                        e.stopPropagation();
                        handleLocationClick(arg.event.extendedProps.event)}
                        }>
                        <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                            <p>{arg.event.extendedProps.addressName}</p>
                    </div>
                    <div className={styles.tags}>
                        <ul>
                            {arg.event.extendedProps.tags.slice(0, 2).map((tag: string, index: number) => (
                                <li key={index}>
                                    <span>
                                        #{tag} 
                                    </span>
                                    {index === 1 ? " ..." : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            >
            </FullCalendar>
        </div>
    )
} 

export default MyCalendar;