import React, { useState, useEffect } from "react";
import { User } from "../../../../types/User";
import { useUserContext } from "../../../../context/UserContext";
import { JoinRequest } from "../../../../types/JoinRequest";
import { Event } from "../../../../types/Event";
import axiosInstance from "../../../../axios/axios";
import styles from "./CompanionsContainerModal.module.css";
import { toast } from "react-toastify";

interface Props {
  event: Event;
  onClose: () => void;
  joinRequests: JoinRequest[];
}

const CompanionsContainerModal: React.FC<Props> = ({ event, onClose, joinRequests }) => {

  const { currentUser } = useUserContext();
  const [companions, setCompanions] = useState<User[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);

  const getCompanions = async () => {
    try {
      const response = await axiosInstance.get(`/companions/${currentUser?.username}`);
      setCompanions(response.data);
    } catch (error) {
      console.error("Error fetching companions:", error);
    }
  };

  const toggleInvitation = (user: User) => {
    setInvitedUsers((prev) => {
      const alreadyInvited = prev.find((u) => u.username === user.username);
      if (alreadyInvited) {
        return prev.filter((u) => u.username !== user.username);
      } else {
        return [...prev, user];
      }
    });
  };

  const sendInvitationLink = async () => {
    if (invitedUsers.length === 0) {
      toast.warn("Please select at least one companion.");
      return;
    }

    try {
      await axiosInstance.post(`/events/${event.id}/invite`, invitedUsers);
      toast.success(invitedUsers.length === 1 ? "Invitation is sent" : "Invitations are sent");
    } catch (error) {
      toast.error("Error while sending invitation.");
    }
  };

  useEffect(() => {
    if (event.id !== 0) {
      getCompanions();
    }
  }, [event.id]);

  const filteredCompanions = companions.filter(
    (companion) =>
      !joinRequests.some((request) => request.user.username === companion.username) &&
      !event.attendees.some((attendee) => attendee.username === companion.username)
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.header}>
          Invite List ({filteredCompanions.length})
        </h3>
        <div className={styles.attendeeList}>
          {filteredCompanions.map((companion) => (
            <div
              key={companion.username}
              className={`${styles.attendeeCard} ${
                invitedUsers.some((u) => u.username === companion.username) ? styles.selected : ""
              }`}
              onClick={() => toggleInvitation(companion)}
            >
              <img src={companion.profilePictureUrl} alt="Profile" />
              <div>
                <h5>{companion.firstName} {companion.lastName}</h5>
                <strong>@{companion.username}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.actions}>
          <button onClick={sendInvitationLink}>Send Invitation</button>
          <button className={styles.closeButton} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CompanionsContainerModal;
