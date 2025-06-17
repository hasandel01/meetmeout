import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from './SearchBox.module.css';
import { User } from '../../../../types/User';
import { Event } from '../../../../types/Event';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../../../context/UserContext';
import { useEffect, useState } from 'react';
import axiosInstance from '../../../../axios/axios';
import { Invitation } from '../../../../types/Like';
import {toast} from "react-toastify";

interface SearchBoxProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (query: string) => void;
  users: User[];
  events: Event[];
  show: boolean;
  onFocus: () => void;
  onBlur: () => void;
}



const SearchBox = ({ query, setQuery, onSearch, users, events, show, onFocus, onBlur}: SearchBoxProps) => {

  const navigate = useNavigate();
  const {currentUser} = useUserContext();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [requestSentEvents, setRequestSentEvents] = useState<Event[]>([]);

      useEffect(() => {
          Promise.all([
              getInvitations(),
              getRequestSentEvents()]
          )
      }, []);

    const getInvitations = async () => {
        return axiosInstance.get("/events/invitations")
            .then(res => setInvitations(res.data))
            .catch(() => toast.error("Error getting invitations"));
    };

    const getRequestSentEvents = async () => {
        return axiosInstance.get("/events/request-sent")
            .then(res => setRequestSentEvents(res.data))
            .catch(() => toast.error("Error getting request sent events."));
    };


  return (
    <div className={styles.searchBar}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon}/>
                    <input 
                        type="text" 
                        placeholder="Event, user, tags, category..."
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          onSearch(e.target.value);
                        }}
                        onBlur={onBlur}
                        onFocus={onFocus}
                      />
                      {show && (
                      <div className={styles.searchResults}>
                        {users.length === 0 && events.length === 0 && (
                          <div style={{ display: "flex", flexDirection: "row", textAlign: "center", padding: "20px", color: "#888", overflow: "hidden"}}>
                            <span style={{ fontSize: "20px" }}>🔍</span>
                            <p style={{ margin: "8px 0 0 0", fontStyle: "italic" }}>
                              No results found
                            </p>
                          </div>
                        )}
                        {users.length > 0 && <label>Users</label>}
                          {users.map((user) => (
                            <div key={user.username} className='user-result' onClick={() => navigate(`/user-profile/${user.username}`)}>
                                <ul>
                                  <li className='user-result-item'>
                                    <img src={user.profilePictureUrl} alt="User Profile" />
                                    <div className={styles.userResultInfo}>
                                      <h2>{user.firstName} {user.lastName}</h2>
                                      <p>@{user.username}</p>
                                    </div>
                                  </li>
                                </ul>
                            </div>
                          ))}
                          {events.length > 0 && <label>Events</label>}
                          {events
                            .filter((event: Event) => event.id !== null && event.id !== undefined &&
                            (
                                !event.isPrivate ||
                                event.attendees.some(user => user.username === currentUser?.username) ||
                                requestSentEvents?.some(req => req.id === event.id) ||
                                invitations?.some(invite => invite.eventId === event.id && invite.status === "PENDING")
                            ))
                            .map((event: Event) => (
                            <div key={event.id} className='event-result'
                                 onClick={() =>  {
                                  
                                  const invite = invitations.find(invite => invite.eventId === event.id  && invite.status === "PENDING");

                                  if (invite && invite.token) {
                                    navigate(`/event/${event.id}/?token=${invite.token}`);
                                  } else {
                                    navigate(`/event/${event.id}`);
                                  }
                                  
                                 }}>
                                <ul>
                                  <li className='event-result-item'>
                                    <img src={event.imageUrl} alt="Event" />
                                    <div className={styles.eventResultInfo}>
                                     <h2>{event.title}</h2>
                                      <p title={event.description}>{event.description}</p>
                                    </div>
                                  </li>
                                </ul>
                            </div>
                            ))}
                          </div>
                    )}
                  </div>
  )
} 

export default SearchBox;
