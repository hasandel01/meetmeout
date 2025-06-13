import styles from "./EventParticipants.module.css";
import { Event } from "../../../../types/Event";
import { JoinRequest } from "../../../../types/JoinRequest";
import { User } from "../../../../types/User";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import AttendeeContainerModal from "../AttendeeContainerModal/AttendeeContainerModal";
import RequesterContainerModal from "../RequesterContainerModal/RequesterContainerModal";

interface Props {
  event: Event;
  currentUser: User | null;
  joinRequests: JoinRequest[];
  setJoinRequests: (joinRequests: JoinRequest[]) => void;
  showAllAttendees: boolean;
  showAllRequests: boolean;
  setShowAllAttendees: (val: boolean) => void;
  setShowAllRequests: (val: boolean) => void;
  goToUserProfile: (username: string) => void;
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
  goToUserProfile
}: Props) => {

    const organizer = event.attendees.find(a => a.username === event.organizer?.username)
    const others = event.attendees.filter(a => a.username !== event.organizer?.username)
    event.attendees = [organizer, ...others].filter((a): a is User => a !== undefined)

    const updateEventAttendees = (username: string) => {
      const joinedUser = joinRequests.find(r => r.user.username === username)?.user;
      if (!joinedUser) return;
      event.attendees.push(joinedUser);
    };

    const updateJoinRequests = (username: string) => {
      setJoinRequests(joinRequests.filter(joinRequest => joinRequest.user.username !== username));
    }

    return (
        <div className={styles.attendees} >
                  <h4>Attendees</h4>
                      <ul>
                        {event.attendees.slice(0,4).map((attendee,index) => 
                          <li key={index} onClick={() => goToUserProfile(attendee.username)}>
                                <div className={styles.pictureContainer}>
                                  {event.organizer?.username === attendee.username &&
                                  <>
                                    <FontAwesomeIcon icon={faStar} className={styles.organizerIcon}
                                    data-tooltip-id="organizer-icon" data-tooltip-content="Organizer"></FontAwesomeIcon>
                                    <Tooltip id="organizer-icon"/>
                                  </>
                                  }
                                  <img src={attendee.profilePictureUrl}></img>
                                </div>
                                <h5>{attendee.firstName}</h5>
                          </li>
                          )}
                          {event.attendees.length > 4 &&
                            <div className={styles.andMoreAvatar}
                                onClick={() => setShowAllAttendees(true)}>
                              <strong> + {event.attendees.length - 4} </strong>
                            </div>
                          }
                      </ul>
                      {showAllAttendees && <AttendeeContainerModal attendees={event.attendees} onClose={() => setShowAllAttendees(false)}></AttendeeContainerModal>}
                      {event.organizer?.username === currentUser?.username &&
                      <>
                      <h4>Requesters</h4>
                            <ul onClick={() => setShowAllRequests(true)}>
                              {joinRequests.slice(0.4).map((request, index) => 
                                  <li key={index}>
                                    <img src={request.user.profilePictureUrl} />
                                    <h5>{request.user.firstName}</h5>
                                  </li>
                              )}
                              {joinRequests.length > 4 && 
                              <div className={styles.andMoreAvatar}
                                   onClick={() => setShowAllRequests(true)}
                                >
                                  <strong>+ {joinRequests.length - 4} more</strong>
                              </div>}
                        </ul>
                        {showAllRequests && 
                        <RequesterContainerModal requests={joinRequests} updateEventAttendees={updateEventAttendees}
                                                updateJoinRequests={updateJoinRequests}
                                                onClose={() => setShowAllRequests(false)}></RequesterContainerModal>}
                        </>
                      }                      
                </div>
    )
}

export default EventParticipants;