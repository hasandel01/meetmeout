import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from './../Header.module.css';
import { User } from '../../../../types/User';
import { Event } from '../../../../types/Event';


interface SearchBoxProps {
  onSearch: (query: string) => void;
  users: User[];
  events: Event[];
  show: boolean;
  onFocus: () => void;
  onBlur: () => void;
  navigateTo: (path: string) => void;
}

const SearchBox = ({ onSearch, users, events, show, onFocus, onBlur, navigateTo }: SearchBoxProps) => (
  <div className={styles.searchBar}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon}/>
                    <input 
                        type="text" 
                        placeholder="Event, user, tags, category..."
                        onChange={(e) => onSearch(e.target.value)}
                        onBlur={onBlur}
                        onFocus={onFocus} />
                      
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
                            <div key={user.id} className='user-result' onClick={() => navigateTo(`/user-profile/${user.username}`)}>
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
                            .filter((event: Event) => event.id !== null && event.id !== undefined)
                            .map((event: Event) => (
                            <div key={event.id} className='event-result' onClick={() => navigateTo(`/event/${event.id}`)}>
                                <ul>
                                  <li className='event-result-item'>
                                    <img src={event.imageUrl} alt="Event" />
                                    <div className='event-result-info'>
                                      <h2>{event.title}</h2>
                                      <p>{event.description}</p>
                                    </div>
                                  </li>
                                </ul>
                            </div>
                            ))}
                          </div>
                    )}
                  </div>
);


export default SearchBox;
