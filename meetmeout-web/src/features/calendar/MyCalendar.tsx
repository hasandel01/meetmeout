import axiosInstance from "../../axios/axios";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { Event } from "../../types/Event";
import styles from "./MyCalendar.module.css";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";


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
    const location = useLocation();
    const initialDate = location.state?.date || new Date().toISOString().split("T")[0];

    const getMyEvents = async () => {
        return axiosInstance.get("/events/mine")
        .then(res => setEvents(res.data))
        .catch(() => toast.error("Error getting events."));
    };

    const navigate = useNavigate();

    useEffect(() => {
        getMyEvents()
    },[])

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

    const calendarRef = useRef<FullCalendar | null>(null);

    useEffect(() => {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return;

        const isMobile = window.innerWidth < 768;
        const targetView = isMobile ? "timeGridThreeDay" : "timeGridWeek";

        if (calendarApi.view.type !== targetView) {
            calendarApi.changeView(targetView);
        }
        }, []);



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
              ref={calendarRef}
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={initialDate}
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
            views={{
                timeGridThreeDay: {
                type: "timeGrid",
                duration: { days: 3 },
                buttonText: "3 Day"
                }
            }}
            windowResize={() => {
                const calendarApi = calendarRef.current?.getApi();
                if (!calendarApi) return;

                const isMobile = window.innerWidth < 768;
                const targetView = isMobile ? "timeGridThreeDay" : "timeGridWeek";

                if (calendarApi.view.type !== targetView) {
                calendarApi.changeView(targetView);
                }
            }}
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
                </div>
            )}
            >
            </FullCalendar>
        </div>
    )
} 

export default MyCalendar;