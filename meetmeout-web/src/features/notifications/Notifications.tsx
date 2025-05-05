import { useNavigate } from "react-router-dom";
import styles from "./Notifications.module.css";
import React, { useEffect } from "react";
import { useState } from "react";
import axiosInstance from "../../axios/axios";
import { Notification } from "../../types/Notification";


const Notifications = () => {

    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const page = 0;
    const size = 20;

    const goToNoticationUrl = (index: number) => {
        navigate(`${notifications.at(index)?.url}`)
      } 

      const getNotifications = async () => {
        try {
            const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`);
            setNotifications(response.data.content);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }     

      useEffect(()=> {
        getNotifications();
      },[])
      
    return (
        <div className={styles.notificationContainer}>
                <div className={styles.notificationDropdown}>
                                  {notifications.length < 1 && <h2>"You're all caught up!" ✨</h2>}
                                  {notifications
                                  .map((notification, index) => (
                                      <ul key={index} onClick={() => goToNoticationUrl(index)}>
                                          <li>
                                            <h4>{notification.title}</h4>
                                            <p>{notification.body}</p>
                                          </li>
                                      </ul>
                                    ))}
            </div>    
        </div>
    )
}


export default Notifications;