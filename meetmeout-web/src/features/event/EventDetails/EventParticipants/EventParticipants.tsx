import styles from "./EventParticipants.module.css";
import { Event } from "../../../../types/Event";
import { JoinRequest } from "../../../../types/JoinRequest";
import { User } from "../../../../types/User";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import AttendeeContainerModal from "../AttendeeContainerModal/AttendeeContainerModal";
import RequesterContainerModal from "../RequesterContainerModal/RequesterContainerModal";
import { useState } from "react";

interface Props {
  event: Event;
  currentUser: User | null;
  joinRequests: JoinRequest[];
  setJoinRequests: (joinRequests: JoinRequest[]) => void;
  showAllAttendees: boolean;
  showAllRequests: boolean;
  setShowAllAttendees: (val: boolean) => void;
  setShowAllRequests: (val: boolean) => void;
}

const EventParticipants = ({
  event,
  currentUser,
  joinRequests,
  setJoinRequests,
  showAllAttendees,
  showAllRequests,
  setShowAllAttendees,
  setShowAllRequests,
}: Props) => {
  const organizer = event.attendees.find(a => a.username === event.organizer?.username);
  const others = event.attendees.filter(a => a.username !== event.organizer?.username);
  const [attendees, setAttendees] = useState<User[]>([organizer, ...others].filter((a): a is User => a !== undefined));

  const updateEventAttendees = (username: string) => {
    const joinedUser = joinRequests.find(r => r.user.username === username)?.user;
    if (!joinedUser) return;
    event.attendees.push(joinedUser);
  };

  const updateJoinRequests = (username: string) => {
    setJoinRequests(joinRequests.filter(joinRequest => joinRequest.user.username !== username));
  };

  return (
    <div className={styles.attendees}>
      <h4>Attendees</h4>
      <ul>
        {attendees.slice(0, 4).map((attendee, index) => (
          <li key={index} onClick={() => setShowAllAttendees(true)}>
            <div className={styles.pictureContainer}>
              {event.organizer?.username === attendee.username && (
                <>
                  <FontAwesomeIcon
                    icon={faStar}
                    className={styles.organizerIcon}
                    data-tooltip-id="organizer-icon"
                    data-tooltip-content="Organizer"
                  />
                  <Tooltip id="organizer-icon" />
                </>
              )}
              <img src={attendee.profilePictureUrl} alt="profile" />
            </div>
            <h5>{attendee.firstName}</h5>
          </li>
        ))}
        {attendees.length > 4 && (
          <div className={styles.andMoreAvatar} onClick={() => setShowAllAttendees(true)}>
            <strong> + {attendees.length - 4} </strong>
          </div>
        )}
      </ul>

      {showAllAttendees && currentUser && (
        <AttendeeContainerModal
          attendees={attendees}
          setAttendees={setAttendees}
          currentUser={currentUser}
          event={event}
          onClose={() => setShowAllAttendees(false)}
        />
      )}

      {event.organizer?.username === currentUser?.username && (
        <>
          <h4>Requesters</h4>
          <ul>
            {joinRequests.slice(0, 4).map((request, index) => (
              <li key={index} onClick={() => setShowAllRequests(true)}>
                <img src={request.user.profilePictureUrl} alt="requester" />
                <h5>{request.user.firstName}</h5>
              </li>
            ))}
            {joinRequests.length > 4 && (
              <div className={styles.andMoreAvatar} onClick={() => setShowAllRequests(true)}>
                <strong>+ {joinRequests.length - 4} more</strong>
              </div>
            )}
          </ul>

          {showAllRequests && (
            <RequesterContainerModal
              requests={joinRequests}
              updateEventAttendees={updateEventAttendees}
              updateJoinRequests={updateJoinRequests}
              onClose={() => setShowAllRequests(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EventParticipants;
