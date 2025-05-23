import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";
import { Event } from "../../../types/Event";
import {toast} from 'react-toastify';
import styles from './EventDetails.module.css'
import { faStar, faImage} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  const [review, setReview] = useState<Review| undefined>(undefined);


  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState<string>('');

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

      const response = await axiosInstance.post(`/add-comment/${eventId}`, newComment)
    
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
        await axiosInstance.delete(`/delete-comment/${commentId}`);
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
        await axiosInstance.put(`/update-comment/${commentId}`, { 
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

  const handleAddReview = async () => {

    try {
      const response = await axiosInstance.post(`/add-review/${event.id}`, review);

      setEvent(prev => ({
        ...prev,
        reviews: [...prev.reviews, response.data]
      }))

      if(currentUser) {
        setReview({
          reviewId: 0,
          reviewer: currentUser,
          content: '',
          updatedAt: '',
          rating: 0
        });
      }

    } catch(error) {
      toast.error("Error adding review.");
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
        <>
            {areReviewConditionsSatisfied() && (
              <div className={styles.reviewPopup}>
                <h4>Review</h4>
                <p>Please share your thoughts about the event.</p>
                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className={styles.starIcon}
                      onClick={() => {
                        if (review) {
                          setReview({
                            reviewId: review.reviewId,
                            reviewer: review.reviewer,
                            content: review.content,
                            updatedAt: review.updatedAt,
                            rating: star
                          });
                        }
                      }}
                      style={{ color: (review?.rating ?? 0) >= star ? "gold" : "gray" }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Write your review here..."
                  value={review?.content}
                  onChange={(e) => {
                    if (review) {
                      setReview({
                        reviewId: review.reviewId,
                        reviewer: review.reviewer,
                        updatedAt: review.updatedAt,
                        rating: review.rating,
                        content: e.target.value
                      });
                    }
                  }}
                ></textarea>
                <button onClick={() => handleAddReview()}>Submit Review</button>
              </div>
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

                <div className={styles.eventCardAndComment}>
                  {currentUser &&
                  ( <EventHeader
                    event={event}
                    currentUser={currentUser}
                    joinRequests={joinRequests}
                  />
                    )
                  }
                        <EventDetailsCard
                              event={event}
                              weather={weather}
                              currentUser={currentUser ?? null}
                              options={options}
                              handleLocationClick={handleLocationClick}
                              handleLike={handleLike}
                            />
                        <EventComments
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
                <div>
                  <Chat eventId={event.id}></Chat>
                  {currentUser && (
                    <EventReviews
                      reviews={event.reviews}
                      currentUser={currentUser}
                      handleDeleteReview={handleDeleteReview}
                      handleEditReview={handleEditReview}
                    />
                  )}
          </div>
        </> 
        <>  
            {event.status === "ENDED" && 
              <div className={styles.photoUploadContainer}>
                <h4>Upload Photos</h4>
                <input
                  type="file"
                  id="event-photo-upload"
                  style={{ display: "none" }}
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      await uploadEventPhotos(event.id, Array.from(e.target.files));
                      e.target.value = "";
                    }
                  }}
                />
                <FontAwesomeIcon icon={faImage} /> Resim Yükle
                <label htmlFor="event-photo-upload" style={{ cursor: "pointer" }}>
                  <span>Click to upload photos</span>
                </label>
                <p>Upload photos of the event here. You can upload multiple photos at once.</p>
              </div>
            }      
                  <div className={styles.photoContainer}>
                    <h4>Photos</h4>
                    <div className={styles.photoGrid}>
                      {event.eventPhotoUrls && event.eventPhotoUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Photo ${index + 1}`} />
                      ))}
                    </div>
                  </div>
          </>
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