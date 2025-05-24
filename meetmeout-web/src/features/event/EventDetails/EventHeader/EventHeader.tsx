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

interface EventHeaderProps {
  event: Event;
  currentUser: User;
  joinRequests: JoinRequest[];
  setCurrentTab: (val: number) => void;
  uploadEventPhotos: (eventId: number, photos: File[]) => Promise<void>;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, currentUser, joinRequests, setCurrentTab, uploadEventPhotos }) => {

    const navigate = useNavigate();
      const [showInviteModal, setShowInviteModal] = useState(false);
    

    const handleLeaveEvent = async () => {
        try {

        await axiosInstance.post(`/events/${event.id}/leave`);
        navigate("/")


        } catch(error) {
            toast.error("Error leaving event.")
        }
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
            }
            else {
                toast.error("You couldn't join to the event.")
            }

        } catch(error) {
            toast.error("You couldn't join to the event.")
        }

    }

    return (
        <div className={styles.eventHeader}>
            <div className={styles.eventTab}>
                <label onClick={() => setCurrentTab(1)}>Info</label>
                <label onClick={() => setCurrentTab(2)}>Route</label>
                <label onClick={() => setCurrentTab(3)}>Reviews & Photos</label>
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
                            <FontAwesomeIcon onClick={(e) => {
                                            e.stopPropagation();
                                            handleLeaveEvent()
                                        }}
                                        className={styles.editButton} icon={faRightFromBracket} size="2x" />
                            </>
                        )}
                        </div>
                            ) : (
                            <button disabled={isDisabled(event)}
                                onClick={() => handleJoinEvent(event.id)} 
                                className={styles.joinButton}>
                                Join Event 
                                </button> 
                        )}
                  </div>
    );
};

export default EventHeader;