import { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faBell, faUserGroup, faHome, faBars, faGear, faRightFromBracket, faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../../axios/axios';
import { User } from '../../../types/User';
import { useEffect } from 'react';
import { Event } from '../../../types/Event';
import styles from "./Header.module.css";
import useMediaQuery from "./../hooks/useMediaQuery";
import { useNotificationContext } from '../../../context/NotificationContext';
import { useUserContext } from '../../../context/UserContext';
import SearchBox from './SearchBox/SearchBox';

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const {currentUser} = useUserContext();
    const [showMenu, setShowMenu] = useState(false);
    const isActive = (path: string) => location.pathname === path;

    const [showSearchResults, setShowSearchResults] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const isMobile = useMediaQuery("(max-width: 768px)");
    const [showBarMenu, setShowBarMenu] = useState(false);
    const page = 0;
    const size = 3;
    const {notifications} = useNotificationContext();

    const triggerUserMenu = () => {
        setShowMenu(!showMenu);
      }  

      const handleSignOut = () => {
        localStorage.removeItem("accessToken");
        navigate("/login");
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
          setEvents(response.data.events)

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
                <SearchBox
                  onSearch={globalSearch}
                  users={users}
                  events={events}
                  show={showSearchResults}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  navigateTo={(path: string) => navigate(path)}
                />
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
                              navigate(`/user-profile/${currentUser?.username}`)
                              setShowBarMenu(false)
                              }} className={styles.barMenuItem}>
                                <img onClick={triggerUserMenu} src={currentUser?.profilePictureUrl} alt="User Profile" />
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
                              navigate(`${currentUser?.username}/companions`)
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
                          onClick={() => navigate(`${currentUser?.username}/companions`)}
                          className={`${styles.navItem} ${isActive(`/${currentUser?.username}/companions`) ? styles.active : ''}`}
                        >
                          <FontAwesomeIcon icon={faUserGroup} size="2x" />
                          <label> Companions </label>
                        </span>
                        <span
                          onClick={() => navigate(`/my-calendar`)}
                          className={`${styles.navItem} ${isActive(`/my-calendar`) ? styles.active : ''}`}
                          >
                            <FontAwesomeIcon icon={faCalendarDays} size='2x'></FontAwesomeIcon>
                            <label>Calendar</label>
                        </span>
                        <span 
                              onClick={() => navigate("/notifications")}
                              className={`${styles.navItem} ${isActive("/notifications") ? styles.active : ''}`}
                            >
                              <div className={notifications.filter(n => !n.read).length > 0 ? styles.iconWrapperHas : styles.iconWrapper}>
                              {notifications.filter(n => !n.read).length > 0 && (
                                  <div className={styles.notificationBadge}>
                                    {notifications.filter(n => !n.read).length}
                                  </div>
                                )}
                                <FontAwesomeIcon icon={faBell} size="2x" />
                              </div>
                              <label>Notifications</label>
                          </span>
                  </div>
                  <div className={styles.userShortcut} onClick={triggerUserMenu}>
                        <img onClick={triggerUserMenu} src={currentUser?.profilePictureUrl} alt="User Profile" />
                  </div>
                  {showMenu && (
                      <div className={styles.userMenu}>
                          <ul>
                          {currentUser?.username && (
                              <li><a href={`/user-profile/${currentUser.username}`}>Profile </a></li>)}
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