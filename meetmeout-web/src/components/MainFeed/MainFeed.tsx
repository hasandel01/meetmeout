import styles from "./MainFeed.module.css";
import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { useState } from "react";
import { Event } from "../../types/Event";
import { useLocation} from "react-router-dom";
import { toast } from "react-toastify";
import { useUserContext } from "../../context/UserContext";
import { Invitation } from "../../types/Like";
import MainFeedMap from "./MainFeedMap/MainFeedMap";
import { MapContainer } from "react-leaflet";
import { TileLayer } from "react-leaflet";
import MapPanner from "./MainFeedMap/MainFeedMapPanner/MainFeedMapPanner";
import EventCard from "./EventCard/EventCard";
import FilterPanel from "./EventFilterPanel/FilterPanel";
import { useLocationContext } from "../../context/LocationContex";
import { calculateDistance } from "../../utils/calculateDistance";

const MainFeed = () => {

    const location = useLocation();
    const flyTo = location.state?.flyTo;

    if(flyTo) {
        sessionStorage.setItem("flyTo", JSON.stringify({
        lat: flyTo.latitude,
        lng: flyTo.longitude
        }));
    }
 
    const [events, setEvents] = useState<Event[] | null>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[] |null>();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const {currentUser} = useUserContext();
    const [loading, setLoading] = useState(true);
    const [requestSentEvents, setRequestSentEvents] = useState<Event[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const {userLatitude, userLongitude } = useLocationContext();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [showFreeEvents, setShowFreeEvents] = useState(false);
    const [filterGroup, setFilterGroup] = useState<'All Events' | 'My Events' | 'My Drafts'>('All Events');
    const [onlyPublicEvents, setOnlyPublicEvents] = useState(false);
    const { userLatitude: lat, userLongitude: lng } = useLocationContext();


    useEffect(() => {
  if (!events) return;

  let result = [...events];

    if (!showPastEvents) {
        result = result.filter(ev => {
        const eventDate = new Date(`${ev.endDate}T${ev.endTime}`);
        return eventDate >= new Date();
        });
    }

    if (showFreeEvents) {
        result = result.filter(ev => ev.fee === 0 || !ev.isFeeRequired);
    }

    if (onlyPublicEvents) {
        result = result.filter(ev => !ev.isPrivate)
    }

    if (selectedCategory) {
    result = result.filter(ev => ev.category === selectedCategory);
    }


    if (filterGroup === 'My Events') {
        result = result.filter(ev => ev.organizer && ev.organizer.username === currentUser?.username);
    }

    if (filterGroup === 'My Drafts') {
        result = result.filter(ev => ev.status === 'DRAFT' && ev.organizer && ev.organizer.username === currentUser?.username);
    }

    setFilteredEvents(result);
    }, [events, showPastEvents, showFreeEvents, selectedCategory, filterGroup, currentUser, onlyPublicEvents]);


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


    const sortQuery = (searchString: string) => {

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
            return calculateDistance(a, lat, lng) - calculateDistance(b, lat, lng);
            });
            setEvents(sortedEvents);
        } else if(searchString === "Most Reviewed") {

            const sortedEvents = [...events]?.sort((a, b) => {
                return b.reviews.length - a.reviews.length;
            })
            setEvents(sortedEvents)
        } else if(searchString === "Highly Scored") {
            
            const sortedEvents = [...events]?.sort((a, b) => {
            const avgA =
            a.reviews.length > 0
                ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
                : 0;

            const avgB =
            b.reviews.length > 0
                ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
                : 0;

        return avgB - avgA; 
    });

    setEvents(sortedEvents);
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


    return (
        <div className={styles.mainFeedContainer}>
            <FilterPanel 
                onSortChange={sortQuery}
                onCategoryChange={setSelectedCategory}
                onShowPastEventsChange={setShowPastEvents}
                onShowFreeEventsChange={setShowFreeEvents}
                onFilterGroupChange={setFilterGroup}
                onOnlyPublicEventsChange={setOnlyPublicEvents}
                onlyPublicEvents={onlyPublicEvents}
                />
        <div className={styles.mapContainer}>
                <MapContainer
                center={[41.0082, 28.9784]}
                zoom={13}
                zoomControl={false}
                className={styles.map}
                style={{ height: "500px", width: "96%", marginBottom: "20px", borderRadius: "12px", border: "2px solid #012A4A"}}
                >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MainFeedMap events={filteredEvents || []} coords={{ lat: userLatitude ?? 41.0082, lng: userLongitude ?? 28.9784 }} />
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
                    filteredEvents
                    ?.map((event) => (
                        (
                           <EventCard 
                            key={event.id}
                                event={event}
                                currentUser={currentUser ?? null}
                                isDisabled={isDisabled}
                                handleLike={handleLike}
                                invitations={invitations}
                                requestSentEvents={requestSentEvents}
                                dateOptions={options}
                                lat={userLatitude}
                                lng={userLongitude}
                            />
                        )
                    )))
                : (
                    <div className={styles.noEvents}>
                        {(filteredEvents?.length ?? 0) > 0 ?
                        (
                            <h2>No result based on filters</h2>
                        ) : 
                        (
                            <h2>No ongoing events. The world is chill 😎</h2>
                        )
                        }
                    </div>
                )}
        </div>
    </div>

    )
}

export default MainFeed;
