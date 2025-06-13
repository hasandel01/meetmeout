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

    
    const handleLeaveEvent = async () => {
        try {

        await axiosInstance.post(`/events/${event.id}/leave`);
        navigate("/")


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
    return event.attendees.some(element => element.username === currentUser?.username)
    }


    const handleJoinEvent = async (eventId: number) => {

        try {

            const response = await axiosInstance.post(`/events/${eventId}/join`);

            if(response.status === 200) {
                toast.success("You successfully joined to the event!")
                      setTimeout(() => {
                        window.location.reload();
                    }, 1200);
            }
            else {
                toast.error("You couldn't join to the event.")
            }

        } catch(error) {
            toast.error("You couldn't join to the event.")
        }

    }

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
            <div className={styles.eventTab}>
                <label onClick={() => setCurrentTab(1)}>Info</label>
                <label onClick={() => setCurrentTab(2)}>Reviews & Photos</label>
            </div>
            {event.status === "ENDED" && 
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
                                    <button disabled={isDisabled(event)}
                                    onClick={() => handleJoinEvent(event.id)} 
                                    className={styles.joinButton}>
                                    Join Event 
                                    </button> 
                                </div>
                        )}
                  </div>
    );
};

export default EventHeader;