  import { useNavigate } from "react-router-dom";
  import styles from "./Notifications.module.css";
  import axiosInstance from "../../axios/axios";
  import { useNotificationContext } from "../../context/NotificationContext";


  const Notifications = () => {

      const navigate = useNavigate();
      const { notifications, fetchNotifications } = useNotificationContext();

      const handleNotificationStatus = async (notificationId: number, url: string) => {
          
          try {
              await axiosInstance.put(`/notifications/change-notification-status/${notificationId}`);
              await fetchNotifications();
          } catch (error) {
              console.error('Error fetching notifications:', error);
          }

          navigate(`${url}`)
        } 

        
      return (
          <div className={styles.notificationContainer}>
                  <div className={styles.notificationDropdown}>
                                    {notifications.length < 1 && <h2>"You're all caught up!" ✨</h2>}
                                    <ul>
                                      {notifications
                                      .map((notification) => (
                                              <li className={notification.read ? `${styles.read}` : `${styles.notRead}`}
                                                  key={notification.id}
                                                  onClick={() => {
                                                    handleNotificationStatus(notification.id, notification.url)
                                                  }}
                                              >
                                                <img src={notification.sender.profilePictureUrl} ></img>
                                                <div className={styles.notificationInfo}>
                                                <h4 className={notification.read ? `` : styles.notReadTitle}>{notification.title}</h4>
                                                  <p>{notification.body}</p>
                                                </div>
                                              </li>
                                        ))}
                                  </ul>

              </div>    
          </div>
      )
  }


  export default Notifications;