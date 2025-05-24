import styles from "./MainFeed.module.css";
import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { useState } from "react";
import { Event } from "../../types/Event";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserContext } from "../../context/UserContext";
import { Invitation } from "../../types/Like";
import MainFeedMap from "./MainFeedMap/MainFeedMap";
import { MapContainer } from "react-leaflet";
import { TileLayer } from "react-leaflet";
import MapPanner from "./MainFeedMap/MainFeedMapPanner/MainFeedMapPanner";
import EventCard from "./EventCard/EventCard";
import FilterPanel from "./EventFilterPanel/FilterPanel";


const MainFeed = () => {
 
    const [events, setEvents] = useState<Event[] | null>([]);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const navigate = useNavigate();
    const {currentUser} = useUserContext();
    const [loading, setLoading] = useState(true);
    const [requestSentEvents, setRequestSentEvents] = useState<Event[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [lng, setLng] = useState<number | undefined>(0);
    const [lat, setLat] = useState<number | undefined>(0);
    const [globalFilter, setGlobalFilter] = useState('All Events');
    const [showPastEvents, setShowPastEvents] = useState(false);


    const location = useLocation();
    const flyTo = location.state?.flyTo;

    if(flyTo) {
        sessionStorage.setItem("flyTo", JSON.stringify({
        lat: flyTo.latitude,
        lng: flyTo.longitude
        }));
    }

    useEffect(() => {
        Promise.all([
            getEvents(), 
            getInvitations(),
            getRequestSentEvents()]
        ).finally(() => setLoading(false))
    }, []);

    const getEvents = async () => {
        return axiosInstance.get("/events")
        .then(res => setEvents(res.data))
        .catch(() => toast.error("Error getting events."));
    };

    const getInvitations = async () => {
        return axiosInstance.get("/events/invitations")
            .then(res => setInvitations(res.data))
            .catch(() => toast.error("Error getting invitations"));
    };

    const getRequestSentEvents = async () => {
        return axiosInstance.get("/events/request-sent")
            .then(res => setRequestSentEvents(res.data))
            .catch(() => toast.error("Error getting request sent events."));
    };

    useEffect(() => {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                } 
            )
        }
    },[])

    
    const searchQuery = (searchString: string) => {

        if(!events) return;

        if(searchString === "Soonest" || searchString === "Latest" ) {
            
            const sortedEvents = [...events]?.sort((a, b) => {
                const dateA = new Date(`${a.startDate}T${a.startTime}`);
                const dateB = new Date(`${b.startDate}T${b.startTime}`);
                return searchString === 'Soonest' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime(); 
            })

            setEvents(sortedEvents);
        }
        else if(searchString === "Recently Added" ) {

            const sortedEvents = [...events]?.sort((a,b) => {
                const timeA = new Date(a.createdAt);
                const timeB = new Date(b.createdAt);
                return timeB.getTime() - timeA.getTime();
            })

            setEvents(sortedEvents);
        } else if(searchString === "Most Liked") {

            const sortedEvents = [...events]?.sort( (a,b) => {
                return b.likes.length - a.likes.length;
            })

            setEvents(sortedEvents)

        } else if(searchString === "Most Attended") {
            
            const sortedEvents = [...events]?.sort( (a,b) => {
                return b.attendees.length - a.attendees.length;
            })
            setEvents(sortedEvents)
        } else if(searchString === "Nearest") {
              
            const sortedEvents = [...events]?.sort((a, b) => {
                return calculateDistance(a) - calculateDistance(b);
            });

            setEvents(sortedEvents);
        }
    
        
    }

        const calculateDistance = (event: Event): number => {
            if (lat === undefined || lng === undefined || !event.latitude || !event.longitude) {
                return Number.MAX_SAFE_INTEGER; 
            }

            const R = 6371;
            const toRad = (value: number) => value * Math.PI / 180;

            const dLat = toRad(event.latitude - lat);
            const dLon = toRad(event.longitude - lng);

            const lat1 = toRad(lat);
            const lat2 = toRad(event.latitude);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.asin(Math.sqrt(a));
            return R * c;
        };


    const handleJoinEvent = async (eventId: number) => {

        try {

            const response = await axiosInstance.post(`/events/${eventId}/join`);

            if(response.status === 200) {
                navigate(`/event/${eventId}`)
            }
            else {
                toast.error("You couldn't join to the event.")
            }

        } catch(error) {
            toast.error("You couldn't join to the event.")
        }

    }

    const isDisabled = (event: Event) => {
        return requestSentEvents.some(requestSentEvents => requestSentEvents.id === event.id) || invitations.some(invitation => invitation.eventId === event.id)
    }

    const handleLike = async (eventId: number) => {
        if (!currentUser) return;
      
        const alreadyLiked = events?.find(ev => ev.id === eventId)
          ?.likes.some(like => like.username === currentUser.username);
      
        setEvents(prevEvents =>
          prevEvents?.map(ev => {
            if (ev.id !== eventId) return ev;
      
            const updatedLikes = alreadyLiked
              ? ev.likes.filter(like => like.username !== currentUser.username)
              : [...ev.likes, {
                  id: 0, 
                  username: currentUser.username,
                  eventId: ev.id
                }];
      
            return {
              ...ev,
              likes: updatedLikes
            };
          }) || []
        );
      
        try {
          await axiosInstance.post(`/events/${eventId}/like`);
        } catch (error) {
          setEvents(prevEvents =>
            prevEvents?.map(ev => {
              if (ev.id !== eventId) return ev;
      
              const rolledBackLikes = alreadyLiked
                ? [...ev.likes, {
                    id: 0,
                    username: currentUser.username,
                    eventId: ev.id
                  }]
                : ev.likes.filter(like => like.username !== currentUser.username);
      
              return {
                ...ev,
                likes: rolledBackLikes
              };
            }) || []
          );
      
          toast.error("Like işlemi başarısız oldu");
        }
      };


    const globalFilterFunction = () => {
    
        if(globalFilter === 'My Drafts')
            return events?.filter(event => event.isDraft)
        else if(globalFilter === 'My Events')
            return events?.filter(event => event.attendees.some(attendee => attendee.username === currentUser?.username) && !event.isDraft)
        else if(globalFilter === 'All Events')
            return events?.filter(event => !event.isDraft)
    }
      
    return (
        <div className={styles.mainFeedContainer}>
            <FilterPanel 
                setGlobalFilter={setGlobalFilter}
                showPastEvents={showPastEvents}
                setShowPastEvents={setShowPastEvents}
                onSortChange={searchQuery}
                />
        <div className={styles.mapContainer}>
                <MapContainer
                center={[41.0082, 28.9784]}
                zoom={13}
                style={{ height: "500px", width: "90%", marginBottom: "20px", borderRadius: "20px"}}
                >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MainFeedMap events={globalFilterFunction()?.filter((event)=> showPastEvents || event.status !== "ENDED") || []} coords={{ lat: lat ?? 41.0082, lng: lng ?? 28.9784 }} />
                {flyTo && <MapPanner coords={flyTo} />}
                </MapContainer>
        </div>
        <div className={styles.onGoingEventsContainer}>

                { loading ? (
                    <>                          
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                    </>

                ) : events && events.length > 0 ? (
                    globalFilterFunction()
                    ?.filter((event)=> showPastEvents || event.status !== "ENDED")
                    ?.map((event) => (
                        (
                           <EventCard 
                            key={event.id}
                                event={event}
                                currentUser={currentUser ?? null}
                                isDisabled={isDisabled}
                                handleJoinEvent={handleJoinEvent}
                                handleLike={handleLike}
                                invitations={invitations}
                                requestSentEvents={requestSentEvents}
                                calculateDistance={calculateDistance}
                                dateOptions={options}
                                lat={lat}
                                lng={lng}
                            />
                        )
                    )))
                : (
                    <div className="no-events">
                        <h2>No ongoing events. The world is chill 😎</h2>
                    </div>
                )}
        </div>
    </div>

    )
}

export default MainFeed;
