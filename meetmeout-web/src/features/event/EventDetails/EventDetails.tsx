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
import { useProfileContext } from "../../../context/ProfileContext";
import Chat from "./Chat/Chat";
import { Review } from "../../../types/Like";
import EventReviews from "./EventReviews/EventReviews";
import EventComments from "./EventComments/EventComments";
import EventParticipants from "./EventParticipants/EventParticipants";
import EventHeader from "./EventHeader/EventHeader";
import EventDetailsCard from "./EventCard/EvetCard";
import EventPhotos from "./EventPhotos/EventPhotos";
import ReviewModal from "./ReviewModal/ReviewModal";

const EventDetails = () => {

  const {currentUser} = useUserContext();
  const [searchParams] = useSearchParams();
  const [isUserAllowed, setIsUserAllowed] = useState(false);
  const token = searchParams.get("token");
  const eventId = useParams<({eventId: string})>()
  const apiKey = "8bab3141ded8b5cedd3745f6991755d4";
  const eventIdNumber = parseInt(eventId?.eventId || "0", 10);
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const navigate = useNavigate();
  const [commentString, setCommentString] = useState('');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const {goToUserProfile} = useProfileContext();
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(true);


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
             eventPhotoUrls: []
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
      if (eventIdNumber > 0) {
        verifyTokenToAccessDetails();
        getEvent();
      }
    }, [eventIdNumber]);

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
        setEvent(response.data);
    } catch(error) {
      toast.error("Error fetching event data.");
    }
  }

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

  const verifyTokenToAccessDetails = async () => {

    try {
      await axiosInstance.post(`/events/${eventIdNumber}/verify-access`, {
        token: token
        });

        setIsUserAllowed(true);
    } catch(error) {
      toast.error("Error verifying token")
      navigate("/")
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


  const handleAddComment = async (eventId: number) => {

    try {
        const newComment = {
          commentId: null,
          comment: commentString,
          eventId: eventId,
          sender: currentUser,
          sentAt: '',
          updatedAt: '',
        };

      const response = await axiosInstance.post(`/comment/${eventId}`, newComment)
    
      setEvent(prev => ({
        ...prev,
        comments: [...prev.comments, response.data]
      }));
      setCommentString('');
    } catch(error) {
    }
  }


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

  const handleDeleteComment = async (commentId: number) => {  


      try {
        await axiosInstance.delete(`/comment/${commentId}`);
        setEvent(prev => ({
          ...prev,
          comments: prev.comments.filter(comment => comment.commentId !== commentId)
        }));
        toast.success("Comment deleted successfully!");
      } catch (error) {
        toast.error("Error deleting comment.");
      }
    }

    const handleEditComment = (comment: any) => {
      setEditingCommentId(comment.commentId);
      setEditedCommentText(comment.comment);
    };

    const saveEditedComment = async (commentId: number) => {
      await handleUpdateComment(commentId, editedCommentText);
      setEditingCommentId(null);
      setEditedCommentText('');
    };

    const handleUpdateComment = async (commentId: number, updatedComment: string) => {
      try {
        await axiosInstance.put(`/comment/${commentId}`, { 
          commentId: commentId,
          comment: updatedComment,
          eventId: event.id,
          sender: currentUser,
          updatedAt: ''
        });

        setEvent(prev => ({
          ...prev,
          comments: prev.comments.map(comment =>
            comment.commentId === commentId ? { ...comment, comment: updatedComment } : comment
          )
        }));

        toast.success("Comment updated successfully!");
      } catch (error) {
        toast.error("Error updating comment.");
      }
    }

  const uploadEventPhotos = async (eventId: number, photos: File[]) => {
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('files', photo);
    });

    try {
      const response = await axiosInstance.post(`/events/${eventId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setEvent(prev => ({
        ...prev,
        eventPhotoUrls: [...prev.eventPhotoUrls, ...response.data]
      }));
      toast.success("Photos uploaded successfully!");
    } catch (error) {
      toast.error("Error uploading photos.");
    }
  }

 

    const handleDeleteReview = async (review: Review) => {
      try {

       await axiosInstance.delete(`/delete-review/${review.reviewId}`);
        
        setEvent(prev => ({
          ...prev,
          reviews: prev.reviews.filter(r => r.reviewId !== review.reviewId)
        }))

      }catch(error) {
        toast.error("Error deleting review.");
      }
    }

    const handleEditReview = async (review: Review) => {
      try {

        const response = await axiosInstance.put(`/update-review/${review.reviewId}`, review);

        setEvent(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r.reviewId === review.reviewId ? response.data : r)
        }))


      }catch(error) {
        toast.error("Error editing review.");
      }
    }

    const areReviewConditionsSatisfied = () => {
      const isAttendee = event.attendees.some(attendee => attendee.username === currentUser?.username);
      const hasNotReviewed = !event.reviews.some(r => r.reviewer.username === currentUser?.username);
      const isEventEnded = event.status === "ENDED";

      return isAttendee && hasNotReviewed && isEventEnded;
    }


  return (
    <div className={styles.eventContainer}>
      {isUserAllowed ? (
        <>
          {currentUser && showReviewModal && areReviewConditionsSatisfied() && (
            <ReviewModal
              event={event}
              currentUser={currentUser}
              setEvent={setEvent}
              onClose={() => setShowReviewModal(false)}
            />
          )}
            {currentUser && (
              <EventParticipants
                event={event}
                currentUser={currentUser ?? null}
                joinRequests={joinRequests}
                showAllAttendees={showAllAttendees}
                setShowAllAttendees={setShowAllAttendees}
                showAllRequests={showAllRequests}
                setShowAllRequests={setShowAllRequests}
                goToUserProfile={goToUserProfile}
              />
              )}
                <div className={styles.eventDetailsContainer}>
                    {currentUser &&
                    ( <EventHeader
                      event={event}
                      setEvent={setEvent}
                      currentUser={currentUser}
                      joinRequests={joinRequests}
                      setCurrentTab={setCurrentTab}
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
                            comments={event.comments}
                            currentUser={currentUser}
                            eventId={event.id}
                            commentText={commentString}
                            setCommentText={setCommentString}
                            handleAddComment={handleAddComment}
                            handleEditComment={handleEditComment}
                            handleDeleteComment={handleDeleteComment}
                            editingCommentId={editingCommentId}
                            editedCommentText={editedCommentText}
                            setEditingCommentId={setEditingCommentId}
                            setEditedCommentText={setEditedCommentText}
                            saveEditedComment={saveEditedComment}
                          />
                      </div>
                        <Chat eventId={event.id}></Chat>
                    </div>
                    }
                    {currentTab === 3 && (
                      <div className={styles.reviewsAndPhotos}>
                        {currentUser && (
                          <EventReviews
                            reviews={event.reviews}
                            currentUser={currentUser}
                            handleDeleteReview={handleDeleteReview}
                            handleEditReview={handleEditReview}
                          />
                        )}
                        <EventPhotos
                          event={event}
                        />
                      </div>
                    )}
                </div>
            </> 
      )
      : (
        <div>
            <strong>YOU ARE NOT ALLOWED TO SEE THIS PAGE!</strong>
          </div>
      )
      
      }
    </div>
  );
}


export default EventDetails;