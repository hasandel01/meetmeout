import React from 'react';
import styles from './EventHeader.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPenToSquare, faTrash, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Event } from '../../../../types/Event';
import { User } from '../../../../types/User';
import { JoinRequest } from '../../../../types/JoinRequest';
import { Tooltip } from "react-tooltip";
import CompanionsContainerModal from "../CompanionsContainerModal/CompanionContainerModal";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axiosInstance from "../../../../axios/axios";
import { useState } from 'react';
import { faImage } from "@fortawesome/free-solid-svg-icons";
import confetti from "canvas-confetti";
import  { useRef, useEffect } from 'react';
import qs from 'qs';

interface EventHeaderProps {
  event: Event;
  setEvent: (event: Event) => void;
  currentUser: User;
  joinRequests: JoinRequest[];
  setCurrentTab: (val: number) => void;
  uploadEventPhotos: (eventId: number, photos: File[]) => Promise<void>;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, currentUser, joinRequests, setCurrentTab, uploadEventPhotos, setEvent }) => {

    const navigate = useNavigate();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteEventModel, setShowDeleteEventModal] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictingEvents, setConflictingEvents] = useState<Event[]>([]);
    
    const handleLeaveEvent = async () => {
        try {

        await axiosInstance.post(`/events/${event.id}/leave`);
        
        if(event.organizer?.username === currentUser.username)
            toast.success("You successfully deleted your event.");
        else
            toast.success("You successfully leave the event.")
        
        setTimeout(() => navigate("/"), 500);

        } catch(error) {
            toast.error("Error leaving event.")
        }
    } 

        const showConfetti = () => {
            confetti({
                particleCount: 200,
                spread: 80,
                origin: {y:0.6},
            })
        }

      const showUsersToInvite = () => {
        setShowInviteModal(prev => !prev)
      }
     

    const isDisabled = (event: Event) => {
        return event.attendees.some(element => element.username === currentUser?.username) || event.attendees.length === event.maximumCapacity 
    }


    const handleJoinEvent = async (eventId: number) => {
    
    try {

        
        if (!currentUser?.participatedEventIds || currentUser.participatedEventIds.length === 0) {
                await joinEventRequest(eventId);
                return;
        }
        
        const response = await axiosInstance.get(`/events/with-ids`, {
                params: { ids: currentUser.participatedEventIds },
                    paramsSerializer: (params) => {
                        return qs.stringify(params, { arrayFormat: 'repeat' });
                    }
                });        
        
        const userEvents: Event[] = response.data;
        
        const conflicts = userEvents.filter(e => {
            const eStart = new Date(`${e.startDate}T${e.startTime}`);
            const eEnd = new Date(`${e.endDate}T${e.endTime}`);
            const currentStart = new Date(`${event.startDate}T${event.startTime}`);
            const currentEnd = new Date(`${event.endDate}T${event.endTime}`);

            return eStart < currentEnd && eEnd > currentStart;
        });

        if (conflicts.length > 0) {
        setConflictingEvents(conflicts);
        setShowConflictModal(true);
        return;
        }

        await joinEventRequest(eventId);

    } catch (error) {
        toast.error("Could not check your calendar.");
    }
    };


    const joinEventRequest = async (eventId: number) => {
        try {
            const response = await axiosInstance.post(`/events/${eventId}/join`);
            if (response.status === 200) {
            toast.success("You successfully joined the event!");
            setTimeout(() => window.location.reload(), 1200);
            } else {
            toast.error("Couldn’t join the event.");
            }
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error("Event is full, you can't join this event.");
            } else {
                toast.error("Couldn’t join the event.");
            }
        }
    };

    const handlePublishEvent = async () => {

        try {
            const response = await axiosInstance.put(`/events/publish/${event.id}`)
            
            console.log("OK")
            console.log(response.data)
            if(response.data) {
                showConfetti();
                setEvent({...event, isDraft: false});
            }
        }
        catch (error) {
            toast.error("ERROR PUBLISHING EVENT.")
        }
    }

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDeleteEventModal(false);
        }
    };

    if (showDeleteEventModel) {
        document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, [showDeleteEventModel]);


    return (
        <div className={styles.eventHeader}>
        {showDeleteEventModel &&
        <div className={styles.deleteEventModalOverlay}>
            <div className={styles.deleteEventModal} ref={modalRef}>
                <h4>{(event.organizer?.username === currentUser?.username ) ? "Are you sure to delete the event. This process cannot be undone ⚠️" 
                : "Are you sure to leave the event? 😥 "}
                </h4>
                <div className={styles.deleteEventModalButtons}>
                    <button
                    className={styles.confirmButton}
                    onClick={() => {
                        setShowDeleteEventModal(false);
                        handleLeaveEvent();
                    }}
                    >
                    Yes
                    </button>
                    <button
                    className={styles.cancelButton}
                    onClick={() => setShowDeleteEventModal(false)}
                    >
                    Cancel
                    </button>
                </div>
            </div>
        </div>}
        {showConflictModal && conflictingEvents.length > 0 && (
            <div className={styles.deleteEventModalOverlay}>
                <div className={styles.deleteEventModal} ref={modalRef}>
                <h4>⚠️ You have overlapping events!</h4>
                <p>The following events conflict with this one:</p>
                <ul>
                    {conflictingEvents.map(evt => (
                    <li key={evt.id}>
                        <strong>{evt.title}</strong><br/>
                        {evt.startDate} {evt.startTime} → {evt.endDate} {evt.endTime}
                    </li>
                    ))}
                </ul>
                <div className={styles.deleteEventModalButtons}>
                    <button
                    className={styles.confirmButton}
                    onClick={async () => {
                        setShowConflictModal(false);
                        await joinEventRequest(event.id);
                    }}
                    >
                    Join Anyway
                    </button>
                    <button
                    className={styles.cancelButton}
                    onClick={() => setShowConflictModal(false)}
                    >
                    Cancel
                    </button>
                </div>
                </div>
            </div>
            )}
            <div className={styles.eventTab}>
                <label onClick={() => setCurrentTab(1)}>Info</label>
                <label onClick={() => setCurrentTab(2)}>Reviews & Photos</label>
                <label onClick={() => setCurrentTab(3)}>Route & Event Cars</label>
            </div>
            {event.status === "ENDED" && event.attendees.some(attendee => attendee.username === currentUser.username) &&
              <div className={styles.photoUploadContainer}>
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
                <label htmlFor="event-photo-upload" style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={faImage} /> Upload Photos
                </label>
              </div>
            } 
            {event.isDraft && 
            <label className={styles.publishEvent} onClick={() => handlePublishEvent()}>📢 Publish</label>}
            {event.attendees.some(attendee => attendee.username == currentUser?.username) ?
                (
                <div className={styles.secondButtonGroup}>
                    {event.status !== "ENDED" && event.attendees.length < event.maximumCapacity && !event.isDraft && (
                        <>
                            <FontAwesomeIcon
                            data-tooltip-id="invite-icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                showUsersToInvite();
                            }}
                            className={styles.inviteButton}
                            icon={faUserPlus}
                            size="2x"
                            />
                            {showInviteModal && (
                            <CompanionsContainerModal
                                joinRequests={joinRequests}
                                event={event}
                                onClose={() => setShowInviteModal(false)}
                            />
                            )}
                            <Tooltip id="invite-icon" />
                            <span data-tooltip-id="invite-icon" data-tooltip-content="Invite Friends"></span>
                        </>
                        )}
                        {(event.organizer?.username === currentUser?.username )? (
                            <>
                                {event.status !== "ENDED" &&  event.isDraft &&
                                    <FontAwesomeIcon
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate("/create-event", {state: {draftEvent: event}})
                                        }}
                                        className={styles.editButton} 
                                        icon={faPenToSquare} size="2x" />
                                }
                                    <FontAwesomeIcon 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteEventModal(true);
                                        }}
                                        className={styles.editButton} 
                                        icon={faTrash} size="2x" />
                            </>
                            )
                            : ( 
                            <>
                            <FontAwesomeIcon onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteEventModal(true);
                                        }}
                                        className={styles.editButton} icon={faRightFromBracket} size="2x" />
                            </>
                        )}
                        </div>
                            ) : (
                                    <div className={styles.secondButtonGroup}>
                                    {event.status !== "ENDED" &&

                                        <button disabled={isDisabled(event)}
                                        onClick={() => handleJoinEvent(event.id)} 
                                        className={styles.joinButton}>
                                        {event.attendees.length < event.maximumCapacity ? "Join Event": "Event is Full"} 
                                        </button> 
                                    }
                                    </div>
                        )}
                  </div>
    );
};

export default EventHeader;