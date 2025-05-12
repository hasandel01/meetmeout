// AttendeeContainerModal.tsx
import React from "react";
import styles from "./AttendeeContainerModal.module.css"; // Create this CSS file accordingly
import { User } from "../../../../types/User";
import { useProfileContext } from "../../../../context/ProfileContext";

interface Props {
  attendees: User[];
  onClose: () => void;
}

const AttendeeContainerModal: React.FC<Props> = ({ attendees, onClose }) => {

  const {goToUserProfile} = useProfileContext();
 

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.header}>Attendees ({attendees.length})</h3>
        <div className={styles.attendeeList}>
          {attendees.map((attendee, index) => (
            <div key={index} className={styles.attendeeCard} onClick={() => goToUserProfile(attendee.username)}>
              <img src={attendee.profilePictureUrl} alt="Profile" />
              <div>
                <h5>{attendee.firstName} {attendee.lastName}</h5>
                <strong>@{attendee.username}</strong>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AttendeeContainerModal;
