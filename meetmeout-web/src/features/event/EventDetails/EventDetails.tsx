import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState, useRef } from "react";
import { Event } from "../../../types/Event";
import {toast} from 'react-toastify';
import styles from './EventDetails.module.css';
import { JoinRequest } from "../../../types/JoinRequest";
import { useUserContext } from "../../../context/UserContext";
import axios from "axios";
import { Weather } from "../../../types/Forecast";
import Chat from "./FirstTab/Chat/Chat";
import EventReviews from "./SecondTab/EventReviews/EventReviews";
import EventComments from "./FirstTab/EventComments/EventComments";
import EventParticipants from "./EventParticipants/EventParticipants";
import EventHeader from "./EventHeader/EventHeader";
import EventDetailsCard from "./FirstTab/EventCard/EvetCard";
import EventPhotos from "./SecondTab/EventPhotos/EventPhotos";
import EventRoute from "./ThirdTab/Route/EventRoute";
import CarAssignmentBoard from "./ThirdTab/Car/CarAssignmentBoard";
import ReviewWizardModal from "./ReviewModals/ReviewWizardModal";
import { UserReview } from "../../../types/UserReviews";
import { Invitation } from "../../../types/Like";

const EventDetails = () => {

  const {currentUser} = useUserContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isUserAllowed, setIsUserAllowed] = useState(false);
  const token = searchParams.get("token");
  const eventId = useParams<({eventId: string})>()
  const apiKey = "8bab3141ded8b5cedd3745f6991755d4";
  const eventIdNumber = parseInt(eventId?.eventId || "0", 10);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const navigate = useNavigate();
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);



    const fetchUserReviews = async (organizerId: number) => {
      try {
        const response = await axiosInstance.get(`/user-reviews/of/${organizerId}`);
        console.log(response.data)
        setUserReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch organizer reviews:", error);
      }
    };


    useEffect(() => {
    const tabFromURL = Number(searchParams.get("tab"));
      if ([1, 2, 3].includes(tabFromURL)) {
        setCurrentTab(tabFromURL);
      }
    }, []);


        const handleLocationClick = () => {
          navigate("/", {
            state: {
              flyTo: {
                lat: event.latitude,
                lng: event.longitude,
              }
            }
          })
        }
        
      const [event, setEvent] = useState<Event>({
             id: 0,
             title: '',
             description: '',
             startDate: '',
             endDate: '',
             startTime: '',
             endTime: '',
             imageUrl: "https://res.cloudinary.com/droju2iga/image/upload/v1746880197/default_event_wg5tsm.png",
             tags: [],
             isPrivate: false,
             isDraft: false,
             maximumCapacity: 1,
             status: 'ONGOING',
             attendees: [],
             organizer: null,
             addressName: '',
             endAddressName: '',
             category: '',
             longitude: 0,
             latitude: 0,
             likes: [],
             comments: [],
             reviews: [],
             createdAt: '',
             isThereRoute: false,
             isCapacityRequired: false,
             isFeeRequired: false,
             fee: 0,
             endLatitude: 0,
             endLongitude: 0,
             feeDescription: '',
             routeType: '',
             eventPhotos: [],
             routeJson: ''
         });
    
    const [weather, setWeather] = useState<Weather | null>(null);

    const commentInputRef = useRef<HTMLTextAreaElement>(null);


    const scrollToComment = () => {

      if(commentInputRef.current) {
        commentInputRef.current.scrollIntoView({behavior: "smooth", block: "center"})
        commentInputRef.current.focus();
      }
    }

    
    useEffect(() => {
    if (event.organizer?.id) {
      fetchUserReviews(event.organizer.id);
    }
  }, [event.organizer]);

    useEffect(() => {
      if(event.latitude && event.longitude) {
        getWeather();
      }
    },[event.latitude, event.longitude]);

    useEffect(() => {
      getEvent();
    },[event.isDraft])


    const getEvent = async () => {
      try {
        const response = await axiosInstance.get(`/events/${eventIdNumber}`);
        const fetchedEvent = response.data;
        setEvent(fetchedEvent);

      } catch (error) {
        toast.error("Error fetching event data.");
        setIsCheckingAccess(false);
        navigate("/"); 
      }
    };

    const [inviteDetails, setInviteDetails] = useState<Invitation | null>(null);

    useEffect(() => {
      if (token) {
        fetchInviteDetails();
      }
    }, [token]);

      useEffect(() => {
      if (eventIdNumber > 0 && (!token || inviteDetails)) {
        getEvent();
      }
    }, [eventIdNumber, inviteDetails]);



    const fetchInviteDetails = async () => {
    if (!token) return;
    try {
      const response = await axiosInstance.get(`/events/invite-details`, {
        params: { token },
      });
      setInviteDetails(response.data);
    } catch (error) {
      console.error("Error fetching invite details:", error);
    }
  };

  const hasCheckedAccess = useRef(false);

  
  useEffect(() => {
    const checkAccess = async () => {
    const isOrganizer = event.organizer?.username === currentUser?.username;
    const isAttendee = event.attendees.some(att => att.username === currentUser?.username);
    const isPublic = !event.isPrivate;

    if (isOrganizer || isAttendee || isPublic) {
      setIsUserAllowed(true);
      setIsCheckingAccess(false);
      return;
    }

    if (token) {
      try {
        const response = await axiosInstance.get(`/events/invite-details`, {
          params: { token },
        });

        const invite = response.data;
        setInviteDetails(invite);

        if (
          invite.status === "PENDING" ||
          invite.status === "ACCEPTED"
        ) {
          setIsUserAllowed(true);
          setIsCheckingAccess(false);
        } else {
          toast.error("This invitation is no longer valid.");
          setIsCheckingAccess(false);
          navigate("/");
        }
      } catch (error) {
        toast.error("Invitation check is failed.");
        setIsCheckingAccess(false);
        navigate("/");
      }
    } else {
      toast.error("You don't have the rights to show this page.");
      setIsCheckingAccess(false);
      navigate("/");
    }
  };

   if (!hasCheckedAccess.current && event.organizer && currentUser && (!token || inviteDetails)) {
    hasCheckedAccess.current = true;
    checkAccess();
  }
  
}, [event.organizer, currentUser]);


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

    const handleLike = async () => {
      if (!currentUser) return;

      const alreadyLiked = event.likes.some(like => like.username === currentUser.username);

      const updatedLikes = alreadyLiked
        ? event.likes.filter(like => like.username !== currentUser.username)
        : [...event.likes, {
            id: 0, 
            username: currentUser.username,
            eventId: event.id
          }];

      setEvent(prev => ({
        ...prev,
        likes: updatedLikes
      }));

      try {
        await axiosInstance.post(`/events/${event.id}/like`);
      } catch (error) {

        const rolledBackLikes = alreadyLiked
          ? [...event.likes, {
              id: 0,
              username: currentUser.username,
              eventId: event.id
            }]
          : event.likes.filter(like => like.username !== currentUser.username);

        setEvent(prev => ({
          ...prev,
          likes: rolledBackLikes
        }));

        toast.error("Like işlemi başarısız oldu");
      }
    };


  useEffect(() => {
  if (event.id !== 0) {
    getAllJoinRequests(event.id);
  }
}, [event.id]);


  const getAllJoinRequests = async (eventId: number) => {

    try {
        const response = await axiosInstance.get(`/events/${eventId}/join-requests`);
              setJoinRequests(response.data)
     } catch(error) {
      toast.error("Error getting requesters!")
     }

  }

  const uploadEventPhotos = async (eventId: number, photos: File[]) => {
    
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('files', photo);
    });

    try {

      setLoading(true);

      const response = await axiosInstance.post(`/events/${eventId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setEvent(prev => ({
        ...prev,
        eventPhotos: [...prev.eventPhotos, ...response.data]
      }));
      toast.success("Photos uploaded successfully!");
    } catch (error) {
      toast.error("Error uploading photos.");
    } finally {
        setLoading(false);
    }
  }

  const [hasDismissedReview, setHasDismissedReview] = useState(false);

    useEffect(() => {
      const fetchDismissal = async () => {
        if (event.id === 0 || !currentUser) return;
        try {
          const response = await axiosInstance.get(`/review/${event.id}/dismissal`);
          setHasDismissedReview(response.data);
        } catch (error) {
          console.error("Error checking review dismissal:", error);
        }
      };

      fetchDismissal();
    }, [event.id, currentUser]);



  const [showReviewModal, setShowReviewModal] = useState(false);

    const areReviewConditionsSatisfied = () => {
      const isAttendee = event.attendees.some(att => att.username === currentUser?.username);
      const hasNotReviewed = !event.reviews.some(r => r.reviewer.username === currentUser?.username);
      const isEventEnded = event.status === "ENDED";

      return isAttendee && hasNotReviewed && isEventEnded && !hasDismissedReview;
    };

    const shouldShowOrganizerReview = () => {
        const isAttendee = event.attendees.some(att => att.username === currentUser?.username);
        const isNotOrganizer = currentUser?.username !== event.organizer?.username;
        const isEventEnded = event.status === "ENDED";
          const alreadyReviewed = currentUser && userReviews.some(
            ur =>
              ur.reviewer.id === currentUser.id &&
              ur.organizer.id === event.organizer?.id &&
              ur.event.id === event.id
          );

        return isAttendee && isNotOrganizer && isEventEnded && !alreadyReviewed;
      };

      useEffect(() => {
        if (!event || !currentUser || event.id === 0 || userReviews.length === 0) return;

        const shouldShowFirstStep = areReviewConditionsSatisfied();
        const shouldShowSecondStep = shouldShowOrganizerReview();

        if (shouldShowFirstStep || shouldShowSecondStep) {
          setShowReviewModal(true);
        }
      }, [event, currentUser, userReviews]);



    const handleTabChange = (tabNumber: number) => {
      setCurrentTab(tabNumber);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", tabNumber.toString());
        return newParams;
      });
    };


  return (
    <div className={styles.eventContainer}>
      {isCheckingAccess ? (
          <div className={styles.spinner}></div>
      ) : isUserAllowed ? (
        <>
          {currentUser && showReviewModal && (
              <ReviewWizardModal
                event={event}
                setEvent={setEvent}
                currentUser={currentUser}
                onClose={() => setShowReviewModal(false)}
                showFirstStep={areReviewConditionsSatisfied()}
                showSecondStep={shouldShowOrganizerReview()}
              />
            )} 
            {currentUser && (
              <EventParticipants
                event={event}
                currentUser={currentUser ?? null}
                joinRequests={joinRequests}
                setJoinRequests={setJoinRequests}
                showAllAttendees={showAllAttendees}
                setShowAllAttendees={setShowAllAttendees}
                showAllRequests={showAllRequests}
                setShowAllRequests={setShowAllRequests}
              />
              )}
                <div className={styles.eventDetailsContainer}>
                    {currentUser &&
                    ( <EventHeader
                      event={event}
                      setEvent={setEvent}
                      currentUser={currentUser}
                      joinRequests={joinRequests}
                      setCurrentTab={handleTabChange}
                      uploadEventPhotos={uploadEventPhotos}
                    />
                      )
                    }
                    {currentTab === 1 &&
                      <div className={styles.eventCardAndChat}>
                        <div className={styles.eventCardAndComments}>
                            <EventDetailsCard
                                  onCommentClick={scrollToComment}
                                  event={event}
                                  setEvent={setEvent}
                                  weather={weather}
                                  currentUser={currentUser ?? null}
                                  options={options}
                                  handleLocationClick={handleLocationClick}
                                  handleLike={handleLike}
                                />
                            <EventComments
                              ref={commentInputRef}
                              currentUser={currentUser}
                              event={event}
                              setEvent={setEvent}
                            />
                        </div>
                          <Chat event={event}></Chat>
                      </div>
                    }
                    {currentTab === 2 && (
                      <div className={styles.reviewsAndPhotos}>
                        {currentUser && (
                          <EventReviews
                            reviews={event.reviews}
                            currentUser={currentUser}
                            event={event}
                            setEvent={setEvent}
                          />
                        )}
                        <EventPhotos
                          event={event}
                        />
                      </div>
                    )}
                    {currentTab == 3 && (
                      <div className={styles.routeAndCars}>
                      {currentUser && (
                        <> 
                        <EventRoute event={event} />
                        <CarAssignmentBoard currentUser={currentUser} event={event}/>
                        </>
                      )}
                      </div>
                    )}
                </div>
                {loading && <div className={styles.spinner} />}
            </> 
      )
      : (
          <div style={{ position: "fixed", top: "50%", left: "35%", display: "flex", backgroundColor:"white", color:"blue", textAlign: "center"}}>
            <p>You don't have the rights to view this page.</p>
          </div>
      )
      
      }
    </div>
  );
}


export default EventDetails;