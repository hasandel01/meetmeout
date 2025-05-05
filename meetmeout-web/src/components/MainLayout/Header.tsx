import { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faSearch, faBell, faUserGroup, faHome } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../axios/axios';
import { User } from '../../types/User';
import { useEffect } from 'react';
import { Event } from '../../types/Event';
import SockJS from 'sockjs-client/dist/sockjs'; 
import { Client } from '@stomp/stompjs';
import styles from "./Header.module.css";
import { Notification } from '../../types/Notification';

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const isActive = (path: string) => location.pathname === path;
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const page = 0;
    const size = 0;

    const triggerUserMenu = () => {
        setShowMenu(!showMenu);
      }  
  
    useEffect(() => {
        getMe();
      }
    , []); 
  
  
      const handleSignOut = () => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    }
    
      const getMe = async () => {
    
        try {
    
            const response = await axiosInstance.get("/me");
            setUser(response.data);
        } catch(error) {
          console.error("Error fetching user data:", error);
        }
    
      }

      
      const globalSearch  = async (query: string) => {


        try {

          const response = await axiosInstance.get("/search",
            {
              params: {
                query: query,
                page: page,
                size: size,
              }})

          setUsers(response.data.users);
          setEvents(response.data.events);
          console.log("Search results fetched successfully:", response.data);

        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      }

      const handleSearchBlur = () => {
        setTimeout(() => {
          setShowSearchResults(false);
        }, 200); 
      }

      const handleSearchFocus = () => {
        setShowSearchResults(true);
      }

    useEffect(() => {
        
        const token = localStorage.getItem('accessToken');
        const socket = new SockJS(`http://localhost:8081/ws?token=${token}`);

        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {

                console.log('Connected to WebSocket server');
                
                client.subscribe('/user/queue/notifications', (message) => {
                    if (message.body) {
                        const notification = JSON.parse(message.body);
                        console.log('Received notification:', notification);
                        setNotifications((prevNotifications) => [...prevNotifications, notification]);
                    }
                });
                
            },
        });

        client.activate();
        
        return () => {
            client.deactivate();
        };
    }, []);


    return (
        <header> 
              <div className={styles.logoContainer} onClick={() => navigate("/main-feed")}>
                  <img src="logo_cut.png" alt="Logo" />  
                </div>
                <div className={styles.searchBar}>
                  <FontAwesomeIcon icon={faSearch} style={
                          { color: "#888", marginRight: "10px" } 
                  }/>
                  <input 
                      type="text" 
                      placeholder="Search..."
                      onChange={(e) => globalSearch(e.target.value)}
                      onBlur={handleSearchBlur}
                      onFocus={handleSearchFocus} />
                </div>
                {showSearchResults && (
                  <div className={styles.searchResults}>
                    {users.length === 0 && events.length === 0 && (
                      <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                        <span style={{ fontSize: "24px" }}>🔍</span>
                        <p style={{ margin: "8px 0 0 0", fontStyle: "italic" }}>
                          No results found
                        </p>
                      </div>
                    )}
                   {users.length > 0 && <label>Users</label>}
                   <div className='user-results'>
                     {users.map((user) => (
                       <div key={user.id} className='user-result' onClick={() => navigate(`/user-profile/${user.username}`)}>
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
                   </div>
                   <div className='event-results'>
                     {events.length > 0 && <label>Events</label>}
                     {events.map((event) => (
                       <div key={event.id} className='event-result' onClick={() => navigate(`/event/${event.id}`)}>
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
                  </div>
                )}
                <div className={styles.headerMenu}>
                <span
                        onClick={() => navigate("/main-feed")}
                        className={`${styles.navItem} ${isActive("/main-feed") ? styles.active : ''}`}
                      >
                        <FontAwesomeIcon icon={faHome} size="2x" />
                        <label> Home </label>
                      </span>

                      <span
                        onClick={() => navigate("/create-event")}
                        className={`${styles.navItem} ${isActive("/create-event") ? styles.active : ''}`}
                      >
                        <FontAwesomeIcon icon={faCalendarPlus} size="2x" />
                        <label> Create Event </label>
                      </span>

                      <span
                        onClick={() => navigate(`${user?.username}/companions`)}
                        className={`${styles.navItem} ${isActive(`/${user?.username}/companions`) ? styles.active : ''}`}
                      >
                        <FontAwesomeIcon icon={faUserGroup} size="2x" />
                        <label> Companions </label>
                      </span>
                      <span 
                        onClick={() => navigate("/notifications")}
                        className={`${styles.navItem} ${isActive(`/notifications`) ? styles.active : ''}`}>
                        <FontAwesomeIcon icon={faBell} size="2x"  />
                        <label> Notifications </label>
                        {notifications
                        .filter((notification) => {notification.read === false})
                        .length > 0 && (
                          <span className={styles.notificationBadge}>{notifications.length}</span>
                        )}
                      </span>
                </div>
                <div className={styles.userShortcut} onClick={triggerUserMenu}>
                      <img onClick={triggerUserMenu} src={user?.profilePictureUrl} alt="User Profile" />
                </div>
                {showMenu && (
                    <div className={styles.userMenu}>
                        <ul>
                        {user?.username && (
                            <li><a href={`/user-profile/${user.username}`}>Profile </a></li>)}
                            <li><a href="/settings">Settings</a></li>
                            <li><label onClick={handleSignOut}>Sign out</label></li>
                        </ul>
                      </div>
                            )}
            </header>
    );
}

export default Header;