import styles from "./EventCardDetails.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faHeart, faComment, faLock, faUserGroup, faMoneyBill, faMoneyBill1Wave, faMoneyBillTransfer, faPenToSquare, faSave, faTicket, faCheck } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { Event } from "../../../../types/Event";
import { Weather } from "../../../../types/Forecast";
import { getCategoryIconLabel } from "../../../../mapper/CategoryMap";
import { User } from "../../../../types/User";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import axiosInstance from "../../../../axios/axios";
import { useState, useRef, useEffect } from "react";
import TagInput from "../../CreateEvent/TagInput";

interface Props {
  event: Event;
  setEvent: (event: Event) => void;
  weather: Weather | null; 
  currentUser: User | null;
  options: Intl.DateTimeFormatOptions;
  handleLocationClick: () => void;
  handleLike: () => void;
  onCommentClick: () => void;
}

const EventDetailsCard = ({
  event,
  setEvent,
  weather,
  currentUser,
  options,
  handleLocationClick,
  handleLike,
  onCommentClick
}: Props) => {

  const isMoreThan8DaysLater = (eventDateStr: string): boolean => {
    const today = new Date();
    const eventDate = new Date(eventDateStr);
    const diffInTime = eventDate.getTime() - today.getTime();
    const diffInDays = diffInTime / (1000 * 60 * 60 * 24);
    return diffInDays > 7;
  };

  const returnDayDifference = (): number => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    const diffInMs = eventDate.getDate() - today.getDate();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const navigate = useNavigate();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(event.description);

  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>(event.tags);


  const [isEditingFee, setIsEditingFee] = useState(false);
  const [editedFee, setEditedFee] = useState(event.fee);
  const [editedFeeDesc, setEditedFeeDesc] = useState(event.feeDescription);


  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setIsEditingDescription(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditingDescription(false);
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleDescrtiptionChange();
      }
    };

    if (isEditingDescription) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditingDescription, editedDescription]);



  const handleDescrtiptionChange = async () => {
  try {
    await axiosInstance.put(`/events/${event.id}/description`, { description: editedDescription });
    setIsEditingDescription(false);
    setEvent({...event, description: editedDescription})
  } catch (error) {
    console.error("Description update failed", error);
  }
};

    const handleUpdateTags = async () => {
      try {
        await axiosInstance.put(`/events/${event.id}/tags`, {
          tags: editedTags
        });
        setEvent({ ...event, tags: editedTags });
        setIsEditingTags(false);
      } catch (error) {
        console.error("Tag update failed", error);
      }
    };

const handleFeeChange = async () => {
  try {
    await axiosInstance.put(`/events/${event.id}/fee`, {
      feeAmount: editedFee,
      feeDescription: editedFeeDesc,
      isFeeRequired: true
    });
    setIsEditingFee(false);
  } catch (error) {
    console.error("Fee update failed", error);
  }
};


  const handleCapacityChange = async () => {
        try {

          const response = await axiosInstance.put(`/events/${event.id}/capacity`)
        }
        catch(error) {

        }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.put(
        `/events/${event.id}/event-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setEvent({ ...event, imageUrl: response.data });
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

    const tagsEditRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (tagsEditRef.current && !tagsEditRef.current.contains(event.target as Node)) {
          setIsEditingTags(false);
        }
      }

      const handleKeyDown = (event: KeyboardEvent) => {

        if(event.key === "Escape")
          setIsEditingTags(false);
      }

      if (isEditingTags) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown",handleKeyDown)
      };
    }, [isEditingTags]);






  return (
      <div className={styles.eventCard}>
        <div className={styles.lockContainer}>
          {event.isPrivate && <>
          <FontAwesomeIcon
                  icon={faLock}
                  className={styles.lockIcon}
                  data-tooltip-id="private_event_tooltip" data-tooltip-content="Private Event" />
              <Tooltip id="private_event_tooltip"/>
              </>
          } 
          </div>
          {event.isCapacityRequired &&
           <div className={styles.attendeeContainer}>
            <FontAwesomeIcon
                icon={faUserGroup}
                className={styles.attendeeIcon}/>
            <span>{event.attendees.length}/{event.maximumCapacity}</span>
          </div>
          }
        <div className={styles.eventImageLocationDate}>
            <img src={event.imageUrl} alt={event.title} />
            {currentUser?.username === event.organizer?.username &&
            <>
            <label htmlFor="eventImageUpload" className={styles.editImageLabel}>
                  <FontAwesomeIcon icon={faPenToSquare} /> Change Image
                </label>
                <input
                  id="eventImageUpload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                </>}
              <div className={styles.eventTimeDate}  onClick={() => navigate("/my-calendar", {
                                                                                          state: {
                                                                                            date: event.startDate,
                                                                                            highlightedEventId: event.attendees.some(a => a.username === currentUser?.username)
                                                                                              ? event.id
                                                                                              : undefined,
                                                                                          },
                                                                                        })}>
                <span>
                  <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                  <p>
                    {new Date(event.startDate).toLocaleDateString("en-US", options)} <strong>&bull;</strong> {event.startTime} - {event.endTime}
                  </p>
                </span>
              </div>
              <div className={styles.eventLocation} onClick={handleLocationClick}>
                <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
                <p>{event.addressName}</p>
              </div>
              <div className={styles.tags} ref={tagsEditRef}>
                    <div className={styles.tagsHeader}>
                      <label>Tags</label>
                      {currentUser?.username === event.organizer?.username && (
                        isEditingTags ? (
                          <FontAwesomeIcon
                            className={styles.editDescription}
                            onClick={() => handleUpdateTags()}
                            icon={faCheck}
                          />
                        ) : (
                          <FontAwesomeIcon
                            className={styles.editDescription}
                            onClick={() => setIsEditingTags(true)}
                            icon={faPenToSquare}
                          />
                        )
                      )}
                    </div>
                    <hr />
                    {isEditingTags ? (
                      <div  className={styles.tagsEdit}>
                        <TagInput tags={editedTags} setTags={setEditedTags} />
                      </div>
                    ) : (
                      <ul>
                        {event.tags?.map((tag, index) => (
                          <li key={index}>
                            <span>#{tag}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
        </div>
        <div className={styles.statusAndEventInfo}>
        <div className={event.isDraft ? `${styles.eventStatusDraft}` :  `${styles.eventStatus} ${styles[event.status]}`}>{!event.isDraft && event.status}</div>
          <div className={styles.eventInfo}>
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
          <div className={styles.descriptionContainer}>
                  <div className={styles.descriptionHeader}>
                    <label>Description</label>
                    {currentUser?.username === event.organizer?.username &&
                    <FontAwesomeIcon icon={faPenToSquare} className={styles.editDescription} onClick={() => setIsEditingDescription(true)} />}
                  </div>
                  <hr/>
                  {isEditingDescription ? (
                    <div className={styles.editDescriptionContainer}>
                      <textarea 
                          value={editedDescription} 
                          maxLength={500}
                          style={{ resize: "none", height: "250px"}}
                          onChange={(e) => setEditedDescription(e.target.value)} />
                    </div>
                  ) : (
                    <p>{event.description}</p>
                  )}
                </div>
          {event.isFeeRequired ? (
            <div className={styles.feeInfo}>
              <div className={styles.feeAmount} data-tooltip-id="fee-amount" data-tooltip-content={event.feeDescription}>
                <FontAwesomeIcon icon={faMoneyBill} />
                <span>: {event.fee}$</span>
              </div>
              <Tooltip id="fee-amount"></Tooltip>
            </div>
          ): (
            <div className={styles.feeInfo}>
                <span>Free</span>
            </div>
          )}
          {weather && weather.current && (
            <div className={styles.weatherWidget}>
              <h4>How is the weather on the day of the event?</h4>
              <div className={styles.weatherContent}>
                {!isMoreThan8DaysLater(event.startDate) ? (
                  <div className={styles.weatherInfo}>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
                      alt={weather.daily.at(returnDayDifference())?.summary}
                    />
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
        </div>
        
        <div className={styles.eventActions}>
          <div className={styles.buttonGroup}>
            <FontAwesomeIcon
              icon={event.likes.some(u => u.username === currentUser?.username) ? faHeart : regularHeart}
              className={styles.heartIcon}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            />
            <span>{event.likes.length > 0 ? `${event.likes.length}` : ""}</span>
          </div>
          <div className={styles.buttonGroup}>
            <FontAwesomeIcon icon={faComment} className={styles.commentIcon} onClick={(e) => { e.stopPropagation(); onCommentClick()}} />
            <span>{event.comments.length > 0 ? `${event.comments.length}` : ""}</span>
          </div>
        </div>
      </div>
  );
};

export default EventDetailsCard;