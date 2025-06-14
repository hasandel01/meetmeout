import React from "react";
import styles from "./AttendeeContainerModal.module.css";
import { User } from "../../../../types/User";
import { useProfileContext } from "../../../../context/ProfileContext";
import axiosInstance from "../../../../axios/axios";
import { Event } from "../../../../types/Event";

interface Props {
  event: Event;
  currentUser: User;
  onClose: () => void;
  attendees: User[];
  setAttendees: (updated: User[]) => void;
}


const AttendeeContainerModal: React.FC<Props> = ({ event, onClose, currentUser, attendees, setAttendees}) => {

  const {goToUserProfile} = useProfileContext();

  const handleKickUser = async (attendee: User) => {
    const newList = attendees.filter(a => a.username !== attendee.username);
    setAttendees(newList);

    try {
      await axiosInstance.delete(`/events/${event.id}/kick/${attendee.id}`);
    } catch (error) {
      setAttendees([...newList, attendee]);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.header}>Attendees ({attendees.length})</h3>
        <div className={styles.attendeeList}>
          {attendees.map((attendee, index) => (
            <div key={index} className={styles.attendeeCard}>
              <div  className={styles.infoCard} onClick={() => goToUserProfile(attendee.username)}>
                 <img src={attendee.profilePictureUrl} alt="Profile" />
                <div>
                  <h5>{attendee.firstName} {attendee.lastName}</h5>
                  <strong>@{attendee.username}</strong>
                </div>
                </div>
              {(event.organizer && event.organizer.username && currentUser.username === event.organizer.username) && attendee.username !== currentUser.username && (
                <button onClick={() => handleKickUser(attendee)}>Kick</button>
              )}
            </div>
          ))}
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AttendeeContainerModal;
