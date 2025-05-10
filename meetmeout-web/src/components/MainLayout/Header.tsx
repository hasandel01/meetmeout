import { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faSearch, faBell, faUserGroup, faHome, faBars, faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../axios/axios';
import { User } from '../../types/User';
import { useEffect } from 'react';
import { Event } from '../../types/Event';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import styles from "./Header.module.css";
import useMediaQuery from "./hooks/useMediaQuery";
import { useNotificationContext } from '../../context/NotificationContext';

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const isActive = (path: string) => location.pathname === path;
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [showBarMenu, setShowBarMenu] = useState(false);
    const page = 0;
    const size = 0;
    const {notifications} = useNotificationContext();

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
        const baseUrl = import.meta.env.VITE_SOCKET_BASE_URL
        const socket = new SockJS(`${baseUrl}/ws?token=${token}`);

        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {

                console.log('Connected to WebSocket server');
                
                client.subscribe('/user/queue/notifications', (message) => {
                    if (message.body) {
                        const notification = JSON.parse(message.body);
                        console.log('Received notification:', notification);
                    }
                });
                
            },
        });

        client.activate();
        
        return () => {
            client.deactivate();
        };
    }, []);

    useEffect(() => {
      
      const handleClickOutside = (event: MouseEvent) => {
        const menu = document.querySelector(`.${styles.barMenu}`);
        const button = document.querySelector(`.${styles.barMenuContainer}`);
        if (
          menu &&
          !menu.contains(event.target as Node) &&
          button &&
          !button.contains(event.target as Node)
        ) {
          setShowBarMenu(false);
        }

      }

      if (showBarMenu) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    },[showBarMenu])


    return (
        <header> 
                <div className={styles.logoContainer} onClick={() => navigate("/")}>
                  <img src="/logo_cut.png" alt="Logo" />  
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
                {isMobile ? (
                    <div className={styles.barMenuContainer}>
                      <FontAwesomeIcon icon={faBars} size='2x'
                      onClick={() => setShowBarMenu(prev => !prev)}>
                      </FontAwesomeIcon>
                      {showBarMenu &&
                      <div className={styles.barMenu}>
                        <ul>
                          <li>
                            <div  onClick={() => {
                              navigate(`/user-profile/${user?.username}`)
                              setShowBarMenu(false)
                              }} className={styles.barMenuItem}>
                                <img onClick={triggerUserMenu} src={user?.profilePictureUrl} alt="User Profile" />
                                <label>Profile</label>
                            </div>
                            <div onClick={() => {
                              navigate("/")
                              setShowBarMenu(false)
                            }} className={styles.barMenuItem}>
                              <FontAwesomeIcon icon={faHome} size="2x" />
                              <label> Home </label>
                            </div>
                            <div onClick={() => {
                              navigate("/create-event")
                              setShowBarMenu(false)
                            }} className={styles.barMenuItem}>
                              <FontAwesomeIcon icon={faCalendarPlus} size="2x" />
                              <label> Create Event </label>
                            </div>
                            <div onClick={() => {
                              navigate(`${user?.username}/companions`)
                              setShowBarMenu(false)
                            }} className={styles.barMenuItem}>
                              <FontAwesomeIcon icon={faUserGroup} size="2x" />
                              <label> Companions </label>
                            </div>
                            <div onClick={() => {
                              navigate("/notifications")
                              setShowBarMenu(false)
                            }} className={styles.barMenuItem}>
                              <FontAwesomeIcon icon={faBell} size="2x" />
                              <label>Notifications</label>
                            </div>
                            <div className={styles.barMenuItem}>
                              <FontAwesomeIcon icon={faGear} size= "2x"></FontAwesomeIcon >
                              <label>Settings</label>
                            </div>
                            <div onClick={handleSignOut} className={styles.barMenuItem}>
                              <FontAwesomeIcon icon={faRightFromBracket} size='2x'></FontAwesomeIcon>
                              <label>Sign out</label>
                            </div>
                          </li>
                        </ul>
                      </div>
                      }
                      
                    </div>
                ) : 
                (
                  <>
                  <div className={styles.headerMenu}>
                  <span
                          onClick={() => navigate("/")}
                          className={`${styles.navItem} ${isActive("/") ? styles.active : ''}`}
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
                              className={`${styles.navItem} ${isActive("/notifications") ? styles.active : ''}`}
                            >
                              <div className={notifications.filter(n => !n.read).length > 0 ? styles.iconWrapperHas : styles.iconWrapper}>
                              {notifications.filter(n => !n.read).length > 0 && (
                                  <span className={styles.notificationBadge}>
                                    {notifications.filter(n => !n.read).length}
                                  </span>
                                )}
                                <FontAwesomeIcon icon={faBell} size="2x" />
                              </div>
                              <label>Notifications</label>
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
                  </>
                )}
            </header>
    );
}

export default Header;