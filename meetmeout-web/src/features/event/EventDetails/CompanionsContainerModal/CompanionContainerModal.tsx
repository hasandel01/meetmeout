// AttendeeContainerModal.tsx
import React from "react";
import { User } from "../../../../types/User";
import { useProfileContext } from "../../../../context/ProfileContext";
import styles from "./CompanionsContainerModal.module.css"
import axiosInstance from "../../../../axios/axios";
import {toast} from 'react-toastify';
import { useState, useEffect } from "react";
import { useUserContext } from "../../../../context/UserContext";
import { JoinRequest } from "../../../../types/JoinRequest";
import { Event } from "../../../../types/Event";

interface Props {
  event: Event;
  onClose: () => void;
  joinRequests: JoinRequest[];
}

const CompanionsContainerModal: React.FC<Props> = ({ event, onClose, joinRequests }) => {

  const {goToUserProfile} = useProfileContext();
  const [invitedUsers, setInvitedUsers] = useState<User[]>([])
  const [companions, setCompanions] = useState<User[]>([]);
  const {currentUser} = useUserContext();


  const getCompanions = async () => {
            try {
                const response = await axiosInstance.get(`/${currentUser?.username}/companions`);
                setCompanions(response.data);
            }
            catch (error) {
                console.error("Error fetching companion profile:", error);
            }
  };

    const sendInvitationLink = async (eventId: number) => {
        try {
        await axiosInstance.post(`/events/${eventId}/invite`, invitedUsers);
            toast.success(invitedUsers.length === 1 ? "Invitation is sent" : "Invitations are sent")
        } catch(error) {
            toast.error("Error while sending invitation.")
        }
    }

    useEffect(() => {
      if (event.id !== 0) {
        getCompanions();
      }
    }, [event.id]);

 
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.header}>Invite List ({companions
        .filter(companion => !joinRequests.some(request => request.user.username === companion.username) && !event.attendees.some(attendee => attendee.username === companion.username)).length})</h3>
        <div className={styles.attendeeList}>
          {companions
          .filter(companion => !joinRequests.some(request => request.user.username === companion.username) && !event.attendees.some(attendee => attendee.username === companion.username))
          .map((companion, index) => (
            <>
            <div key={index} className={styles.attendeeCard} onClick={() => goToUserProfile(companion.username)}>
              <img src={companion.profilePictureUrl} alt="Profile" />
              <div>
                <h5>{companion.firstName} {companion.lastName}</h5>
                <strong>@{companion.username}</strong>
              </div>
            </div>
            <button onClick={() => sendInvitationLink(event.id)}> Send Invite </button>
        </>    
          ))}
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CompanionsContainerModal;
