import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";
import { Event } from "../../../types/Event";
import {toast} from 'react-toastify';
import styles from './EventDetails.module.css'
import { faCalendar, faLocationDot, faPenToSquare, faRightFromBracket, faStar, faTrash, faUserPlus, faImage} from "@fortawesome/free-solid-svg-icons";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCategoryIconLabel } from "../../../mapper/CategoryMap";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { JoinRequest } from "../../../types/JoinRequest";
import { Tooltip } from "react-tooltip";
import formatTime from "../../../utils/formatTime";
import { useUserContext } from "../../../context/UserContext";
import axios from "axios";
import { Weather } from "../../../types/Forecast";
import AttendeeContainerModal from "./AttendeeContainerModal/AttendeeContainerModal";
import RequesterContainerModal from "./RequesterContainerModal/RequesterContainerModal";
import { useProfileContext } from "../../../context/ProfileContext";
import Chat from "./Chat/Chat";
import CompanionsContainerModal from "./CompanionsContainerModal/CompanionContainerModal";
import { Review } from "../../../types/Like";

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const {goToUserProfile} = useProfileContext();
  const [review, setReview] = useState<Review>({
    review: 0,
    reviewer: currentUser ?? {
      id: 0,
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      profilePictureUrl: '',
      phone: '',
      about: '',
      companions: []
    },
    content: '',
    updatedAt: '',
    rating: 0
  });



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

  const handleLeaveEvent = async () => {
    try {

    await axiosInstance.post(`/events/${eventId.eventId}/leave`);
    navigate("/")


    } catch(error) {
        toast.error("Error leaving event.")
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
  
  const handleJoinEvent = async (eventId: number) => {

    try {

        const response = await axiosInstance.post(`/events/${eventId}/join`);

        if(response.status === 200) {
            toast.success("You successfully joined to the event!")
        }
        else {
            toast.error("You couldn't join to the event.")
        }

    } catch(error) {
        toast.error("You couldn't join to the event.")
    }

}

  const isDisabled = (event: Event) => {
    return event.attendees.some(element => element.username === currentUser?.username)
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

  
  const showUsersToInvite = () => {
    setShowInviteModal(prev => !prev)
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

  const isMoreThan8DaysLater = (eventDateStr : string): boolean => {

    const today= new Date();
    const eventDate = new Date(eventDateStr);

    const diffInTime = eventDate.getTime() - today.getTime();
    const diffInDays = diffInTime / (1000 * 60 * 60 *24);

    return diffInDays > 7;

  } 

  const returnDayDifference = ():number => {

    const today = new Date();
    const eventDate = new Date(event.startDate);

    const diffInMs = eventDate.getDate() - today.getDate();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    return diffInDays;
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
                      onClick={() => setReview({ ...review, rating: star })}
                      style={{ color: review?.rating >= star ? "gold" : "gray" }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Write your review here..."
                  value={review?.content}
                  onChange={(e) => setReview({ ...review, content: e.target.value })}
                ></textarea>
                <button onClick={() => handleAddReview()}>Submit Review</button>
              </div>
            )}
          <div className={styles.attendees} >
                  <h4>Attendees</h4>
                      <ul>
                        {event.attendees.slice(0,4).map((attendee,index) => 
                          <li key={index} onClick={() => goToUserProfile(attendee.username)}>
                                {event.organizer?.username === attendee.username &&
                                <>
                                  <FontAwesomeIcon icon={faStar} className={styles.organizerIcon}
                                  data-tooltip-id="organizer-icon" data-tooltip-content="Organizer"></FontAwesomeIcon>
                                  <Tooltip id="organizer-icon"/>
                                </>
                                  }
                                <img src={attendee.profilePictureUrl}></img>
                                <h5>{attendee.firstName}</h5>
                          </li>
                          )}
                          {event.attendees.length > 4 &&
                            <div className={styles.andMoreAvatar}
                                onClick={() => setShowAllAttendees(true)}>
                              <strong> + {event.attendees.length - 4} </strong>
                            </div>
                          }
                      </ul>
                      {showAllAttendees && <AttendeeContainerModal attendees={event.attendees} onClose={() => setShowAllAttendees(false)}></AttendeeContainerModal>}
                      {event.organizer?.username === currentUser?.username &&
                      <>
                      <h4>Requesters</h4>
                            <ul onClick={() => setShowAllRequests(true)}>
                              {joinRequests.slice(0.4).map((request, index) => 
                                  <li key={index}>
                                    <img src={request.user.profilePictureUrl} />
                                    <h5>{request.user.firstName}</h5>
                                  </li>
                              )}
                              {joinRequests.length > 4 && 
                              <div className={styles.andMoreAvatar}
                                   onClick={() => setShowAllRequests(true)}
                                >
                                  <strong>+ {joinRequests.length - 4} more</strong>
                              </div>}
                        </ul>
                        {showAllRequests && 
                        <RequesterContainerModal requests={joinRequests} 
                                                onClose={() => setShowAllRequests(false)}></RequesterContainerModal>}
                        </>
                      }                      
                </div>
                <div className={styles.eventCardAndComment}>
                  <div className={styles.eventHeader}>
                                          {event.attendees.some(attendee => attendee.username == currentUser?.username) ?
                                            (
                                            <div className={styles.secondButtonGroup}>
                                            {event.status !== "ENDED" &&
                                                    <>
                                                    <FontAwesomeIcon
                                                            data-tooltip-id="invite-icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                showUsersToInvite()
                                                            }}
                                                            className={styles.inviteButton} 
                                                            icon={faUserPlus} size="2x" />
                                                          {showInviteModal && <CompanionsContainerModal
                                                              joinRequests={joinRequests}
                                                              event = {event}
                                                              onClose={() => setShowInviteModal(false)}></CompanionsContainerModal>}
                                                        <Tooltip id="invite-icon" />
                                                        <span data-tooltip-id="invite-icon" data-tooltip-content="Invite Friends"></span>
                                                    </> 
                                              }
                                              {(event.organizer?.username === currentUser?.username )? (
                                                  <>
                                                  {event.status !== "ENDED" && 
                                                    <FontAwesomeIcon
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          navigate(`/update-event/${event.id}`)
                                                        }}
                                                        className={styles.editButton} 
                                                        icon={faPenToSquare} size="2x" />
                                                  }
                                                  <FontAwesomeIcon 
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleLeaveEvent()
                                                        }}
                                                        className={styles.editButton} 
                                                        icon={faTrash} size="2x" />
                                                  </>
                                                  )
                                                  : ( 
                                                  <>
                                                    <FontAwesomeIcon className={styles.editButton} icon={faRightFromBracket} size="2x" />
                                                  </>
                                                  ) }
                                              </div>
                                                ) : (
                                                <button disabled={isDisabled(event)}
                                                  onClick={() => handleJoinEvent(event.id)} 
                                                  className={styles.joinButton}>
                                                  Join Event 
                                                </button> 

                                            )}
                  </div>
                  <div className={styles.eventCardAndWeatherAPI}>
                    <div className={styles.eventCard}> 
                        <div className={styles.firstColumn}>
                            <img src={event.imageUrl} alt={event.title} />
                            {weather && weather.current && (
                                    <div className={styles.weatherWidget}>
                                    <h4>How is the weather on the day of the event?</h4>
                                      <div className={styles.weatherContent}>
                                        {!isMoreThan8DaysLater(event.startDate) ? (
                                          <div className={styles.weatherInfo}>
                                            <img
                                                  src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`} 
                                                  alt={weather.daily.at(returnDayDifference())?.summary}
                                            ></img>
                                            <div>
                                                  <p>{weather.daily.at(returnDayDifference())?.temp.max.toFixed(0)}</p>
                                                  <p>{weather.daily.at(returnDayDifference())?.temp.min.toFixed(0)}</p>
                                            </div>
                                            <p>{weather.daily.at(returnDayDifference())?.summary}</p>
                                          </div>
                                        ) : (
                                          <div>
                                              We can't provide you weather forecast for this time period. Weather forecast will be shown 8 days before the event date.
                                            </div>
                                        )}

                                      </div>
                                    </div>
                                  )}
                        </div>
                        <div className={styles.secondColumn}>
                              <div className={`${styles.eventStatus} ${styles[event.status]}`}> {event.status}</div>
                                <div className={styles.eventTitle}>
                                  <div className={styles.eventCategory}>
                                      {(() => {
                                        const category = getCategoryIconLabel(event.category);
                                          return (
                                            <span style={{ color: category.color }}>
                                              {category.icon} {category.label}
                                            </span>
                                          );
                                      })()}
                                  </div>
                                  <h2>{event.title}</h2>
                                </div>
                                <div className={styles.eventDetailsInfo}>
                                    <div className={styles.eventTimeDate}>
                                          <span>
                                            <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                                              <p > {new Date(event.startDate).toLocaleDateString("en-US", options)} <strong>&bull;</strong> {event.startTime} - {event.endTime}</p>
                                          </span>
                                    </div>
                                    <div className={styles.eventLocation} onClick={handleLocationClick}>
                                            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                                            <p>{event.addressName}</p>
                                    </div>
                                    <div className={styles.tags}>
                                      {event.tags.map((tag, index) => (
                                        <span key={index} className={styles.tag}>
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                </div>         
                              </div>
                              <div className={styles.eventActions}>
                                              <div className={styles.buttonGroup}>
                                                  <FontAwesomeIcon 
                                                      icon={
                                                          event.likes.some(u => u.username === currentUser?.username)
                                                          ? faHeart
                                                          : regularHeart} 
                                                      className={styles.heartIcon}
                                                      onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleLike()
                                                      }}/>
                                                  <span>{event.likes.length > 0 ? `${event.likes.length}` : ""}</span>
                                              </div>
                                              <div className={styles.buttonGroup}>
                                                  <FontAwesomeIcon 
                                                      icon={faComment} 
                                                      className={styles.commentIcon} />
                                                  <span>{event.comments.length > 0 ? `${event.comments.length}` : ""}</span>
                                              </div>
                                          </div>                     
                              </div>
                        </div>
                        <div className={styles.commentContainer}>
                                <div className={styles.commentContainerAlt}>
                                                  <ul> 
                                                  {event.comments
                                                   .sort((a,b) => {
                                                    const timeA = new Date(a.sentAt)
                                                    const timeB = new Date(b.sentAt);
                                                    return timeA.getTime() - timeB.getTime()
                                                  })
                                                  .map(comment => (
                                                      <li className={styles.commentItem}>
                                                            <div className={styles.commentHeader}>
                                                              <div className={styles.senderInfo}>
                                                                <img src={comment.sender.profilePictureUrl} alt="User Avatar" />
                                                                <span className={styles.username}>{comment.sender.username}</span>
                                                              </div>
                                                              <span> {comment.sentAt !== comment.updatedAt ? "edited" : ""}</span>
                                                              <span className={styles.timestamp}>{formatTime(comment.updatedAt)}</span>
                                                            </div>

                                                            {editingCommentId === comment.commentId ? (
                                                              <div className={styles.editArea}>
                                                                <input
                                                                  type="text"
                                                                  value={editedCommentText}
                                                                  onChange={(e) => setEditedCommentText(e.target.value)}
                                                                />
                                                                <div className={styles.editButtons}>
                                                                  <button onClick={() => saveEditedComment(comment.commentId)}>Save</button>
                                                                  <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                                                                </div>
                                                              </div>
                                                            ) : (
                                                              <p className={styles.commentText}>{comment.comment}</p>
                                                            )}

                                                            {comment.sender.username === currentUser?.username && (
                                                              <div className={styles.commentActions}>
                                                                <FontAwesomeIcon
                                                                  icon={faPenToSquare}
                                                                  className={styles.actionIcon}
                                                                  onClick={() => handleEditComment(comment)}
                                                                  title="Edit"
                                                                />
                                                                <FontAwesomeIcon
                                                                  icon={faTrash}
                                                                  className={styles.actionIcon}
                                                                  onClick={() => handleDeleteComment(comment.commentId)}
                                                                  title="Delete"
                                                                />
                                                              </div>
                                                            )}
                                                          </li>
                                                  ))}
                                              </ul>
                                              <hr/>
                                              <div className={styles.addComment}>
                                                  <input
                                                      type="text"
                                                      placeholder="Add a comment..."
                                                      value={commentString}
                                                      onChange={(e) => setCommentString(e.target.value)}
                                                      onKeyDown={(e) => {
                                                        if(e.key === 'Enter') {
                                                          handleAddComment(event.id);
                                                        }   
                                                      }}
                                                  ></input>
                                              </div>
                                  </div>
                          </div>
                </div>
                <div>
                  <Chat eventId={event.id}></Chat>
                  <div className={styles.reviewContainer}>
                    <h4> Reviews</h4>
                    {event.reviews.map((review, index) => ( 
                      <div key={index} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.senderInfo}>
                            <img src={review.reviewer.profilePictureUrl} alt="User Avatar" />
                            <span className={styles.username}>{review.reviewer.username}</span>
                          </div>
                          <span className={styles.timestamp}>{formatTime(review.updatedAt)}</span>
                        </div>
                        <div className={styles.reviewContent}>
                          <p>{review.content}</p>
                          <div className={styles.reviewStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={faStar}
                                className={styles.starIcon}
                                style={{ color: review.rating >= star ? "gold" : "gray" }}
                              />
                            ))}
                          </div>
                        </div>
                        {review.reviewer.username === currentUser?.username && (
                          <div className={styles.reviewActions}>
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className={styles.actionIcon}
                              onClick={() => handleEditReview(review)}
                              title="Edit"
                            />
                            <FontAwesomeIcon
                              icon={faTrash}
                              className={styles.actionIcon}
                              onClick={() => handleDeleteReview(review)}
                              title="Delete"
                            />
                          </div>
                        )}
                      </div>
                    ))}  
            </div>
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