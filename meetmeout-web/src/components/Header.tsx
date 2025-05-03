import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faSearch, faBell, faUserGroup, faHome, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../axios/axios';
import { User } from '../types/User';
import { useEffect } from 'react';
import '../styles/Header.css';

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showCreateEventForm, setShowCreateEventForm] = useState(false);
    const [isSselected, setIsSelected] = useState(false);
    const isActive = (path: string) => location.pathname === path;

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

    return (
        <header className="header"> 
              <div className="logo-container" onClick={() => navigate("/main-feed")}>
                  <img src="logo_cut.png" alt="Logo" />  
                </div>
                <div className="search-bar">
                  <FontAwesomeIcon icon={faSearch} style={
                          { color: "#888", marginRight: "10px" } 
                  }/>
                  <input type="text" placeholder="Search..." /> 
                </div>
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
                        <FontAwesomeIcon icon={faBell} size="2x" onClick={() => navigate("/notifications")} 
                          />
                        <label> Notifications </label>
                      </span>
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