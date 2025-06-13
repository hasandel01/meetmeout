import styles from "./EventCardDetails.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faHeart, faComment, faLock, faUserGroup, faMoneyBill,faPenToSquare, faCheck } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { Event } from "../../../../types/Event";
import { Weather } from "../../../../types/Forecast";
import { getCategoryIconLabel } from "../../../../mapper/CategoryMap";
import { User } from "../../../../types/User";
import { useNavigate } from "react-router-dom";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
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

  const navigate = useNavigate();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(event.description);

  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>(event.tags);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(event.maximumCapacity);


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


  const handleUpdateCapacity = async () => {
    if (newCapacity <= event.maximumCapacity) return;

    try {
      await axiosInstance.put(`/events/${event.id}/capacity`, { maxCapacity: newCapacity, isCapacityRequired: true });
      setEvent({ ...event, maximumCapacity: newCapacity });
      setIsEditingCapacity(false);
    } catch (error) {
      console.error("Capacity update failed", error);
  }
};



  const getEventDayIndices = () => {
    const today = new Date();
    const startDay = new Date(event.startDate).setHours(0, 0, 0, 0);
    const endDay = new Date(event.endDate ?? event.startDate).setHours(0, 0, 0, 0);

    const indices: number[] = [];
    for (let i = 0; i <= 7; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      const fDay = forecastDate.setHours(0, 0, 0, 0);

      if (fDay >= startDay && fDay <= endDay) {
        indices.push(i);
      }
    }

    return indices;
  };



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
          <Tooltip id="private_event_tooltip"/> </>
        } 
      </div>
        {event.isCapacityRequired &&
        <div
        className={styles.attendeeContainer}
        data-tooltip-id="attendee_tooltip"
        data-tooltip-content="Attendees/Capacity"
        onClick={() => {
          if (currentUser?.username === event.organizer?.username) {
            setIsEditingCapacity(true);
          }
        }}
      >
        <FontAwesomeIcon icon={faUserGroup} className={styles.attendeeIcon} />
        {!isEditingCapacity ? (
          <span>{event.attendees.length}/{event.maximumCapacity}</span>
        ) : (
          <span>
            <input
              type="number"
              value={newCapacity}
              min={event.attendees.length}
              onChange={(e) => setNewCapacity(Number(e.target.value))}
              onBlur={handleUpdateCapacity}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdateCapacity();
                } else if (e.key === "Escape") {
                  setIsEditingCapacity(false);
                  setNewCapacity(event.maximumCapacity);
                }
              }}
              style={{ width: "30px", height: "10px", fontSize: "14px" }}
              autoFocus
            />
          </span>
        )}
      </div>
      }
      <div className={styles.eventDetails}>
        <div className={styles.statusAndEventInfo}>
                <div className={event.isDraft ? `${styles.eventStatusDraft}` :  `${styles.eventStatus} ${styles[event.status]}`}>
                {!event.isDraft && event.status}
                </div>
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
                            ref={textareaRef}
                            value={editedDescription} 
                            maxLength={500}
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
                        <span>: {event.fee}₺</span>
                      </div>
                      <Tooltip id="fee-amount"></Tooltip>
                    </div>
                  ): (
                    <div className={styles.feeInfo}>
                        <span>Free</span>
                    </div>
                  )}
               </div>
            </div>
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
                    <div className={styles.locationDate}>
                        <div className={styles.eventTimeDate} 
                          onClick={() => navigate("/my-calendar", {
                                          state: {
                                              date: event.startDate,
                                              highlightedEventId: 
                                                    event.attendees.some(a => a.username === currentUser?.username)
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
                      <div className={styles.eventLocation} onClick={handleLocationClick} 
                                  data-tooltip-id="location-tooltip" data-tooltip-content= "Click to see on the map.">
                        <FontAwesomeIcon icon={faLocationDot} className={styles.icon}/>
                        <p>{event.addressName}</p>
                        <Tooltip id="location-tooltip"></Tooltip>
                      </div>
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
        </div>        
          {event.status === "ENDED" ? (
          <div className={styles.weatherWidgetSmall}>
              <p>This event has already ended. Weather forecast is no longer available.</p>
            </div>
            ) : (
            weather && weather.daily && !isMoreThan8DaysLater(event.startDate) ? (
              <div className={styles.weatherWidget}>
                <h4>Weather During the Event</h4>
                <div className={styles.weatherRow}>
                  {getEventDayIndices().map((i) => {
                    const daily = weather.daily[i];
                    if (!daily) return null;
                    const forecastDate = new Date();
                    forecastDate.setDate(new Date().getDate() + i);
                    return (
                      <div className={styles.weatherCard} key={i}>
                        <p className={styles.weatherDate}>{forecastDate.toLocaleDateString("en-US", options)}</p>
                        <img
                          src={`https://openweathermap.org/img/wn/${daily.weather[0].icon}@2x.png`}
                          alt={daily.summary}
                          className={styles.weatherIcon}
                          width="32px"
                          height="32px"
                        />
                        <p className={styles.weatherSummary}>{daily.summary}</p>
                        <p className={styles.weatherTemp}>{daily.temp.max.toFixed(0)}° / {daily.temp.min.toFixed(0)}°</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={styles.weatherWidgetSmall}>
                <p>Weather forecast will be available 8 days before the event.</p>
              </div>
            )
          )}
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