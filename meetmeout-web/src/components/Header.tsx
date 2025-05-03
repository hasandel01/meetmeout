import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faSearch, faBell, faUserGroup, faHome, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../axios/axios';
import { User } from '../types/User';
import { useEffect } from 'react';
import '../styles/Header.css';
import { Event } from '../types/Event';
import { Notification } from '../types/Notification';
import SockJS from 'sockjs-client/dist/sockjs'; 
import { Client } from '@stomp/stompjs';

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const isActive = (path: string) => location.pathname === path;
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const page = 0;
    const size = 20;


    /* State variables for search results */
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const triggerUserMenu = () => {
        setShowMenu(!showMenu);
      }  
  
    useEffect(() => {
        getMe();
      }
    , []); 
  
  
      const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }
    
      const getMe = async () => {
    
        try {
    
            const response = await axiosInstance.get("/me", 
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            setUser(response.data);
            console.log("User data fetched successfully:", response.data);          
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
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            } 
          )

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
        }, 200); // Delay to allow click event to register
      }

      const handleSearchFocus = () => {
        setShowSearchResults(true);
      }


      const handleNotifications = async () => {
        if (notifications.length === 0) {
            await getNotifications();
        }
          setShowNotifications(!showNotifications);
      }

    useEffect(() => {
        
        const token = localStorage.getItem('token');
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


    const getNotifications = async () => {
        try {
            const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setNotifications(response.data.content);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }
      
      

    return (
        <header className="header"> 
              <div className="logo-container" onClick={() => navigate("/main-feed")}>
                  <img src="logo_cut.png" alt="Logo" />  
                </div>
                <div className="search-bar">
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
                  <div className="search-results">
                  {users.length < 0 && events.length < 0 && <p>No results found</p>}
                   {users.length > 0 && <label>Users</label>}
                   <div className='user-results'>
                     {users.length === 0 && events.length === 0 && <p>No results found</p>}
                     {users.map((user) => (
                       <div key={user.id} className='user-result' onClick={() => navigate(`/user-profile/${user.username}`)}>
                           <ul>
                             <li className='user-result-item'>
                               <img src={user.profilePictureUrl} alt="User Profile" />
                               <div className='user-result-info'>
                                 <h2>{user.firstName} {user.lastName}</h2>
                                 <p>{user.username}</p>
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
                <div className="header-menu">
                      <span onClick={() => navigate("/main-feed")}
                          className={isActive("/main-feed") ? "nav-item active" : "nav-item"}>
                        <FontAwesomeIcon icon={faHome} size="2x"/>
                        <label> Home </label>
                      </span>
                      <span onClick={() => navigate("/create-event")}
                          className={isActive("/create-event") ? "nav-item active" : "nav-item"}>
                        <FontAwesomeIcon icon={faCalendarPlus} size='2x'/>
                        <label> Create Event </label>
                      </span>
                      <span onClick={() => navigate(`${user?.username}/companions`)}
                          className={isActive(`${user?.username}/companions`) ? "nav-item active" : "nav-item"}>
                        <FontAwesomeIcon icon={faUserGroup} size="2x" />
                        <label> Companions </label>
                      </span>
                      <span>
                        <FontAwesomeIcon icon={faBell} size="2x" onClick={handleNotifications}/>
                        <label> Notifications </label>
                        {notifications.length > 0 && (
                          <span className="notification-badge">{notifications.length}</span>
                        )}
                      </span>
                      {showNotifications && (
                                  <div className="notification-dropdown">
                                  <h2>Notifications</h2>
                                  {notifications.length === 0 && <p>No notifications</p>}
                                  {notifications.map((notification, index) => (
                                      <div key={index} className='notification-item'>
                                          <p>{notification.title}</p>
                                          <p>{notification.body}</p>
                                      </div>
                                  ))}
                                  </div>    
                      )}
                </div>
                <div className="user-shortcut" onClick={triggerUserMenu}>
                      <img onClick={triggerUserMenu} src={user?.profilePictureUrl} alt="User Profile" />
                </div>
                {showMenu && (
                    <div className="user-menu">
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