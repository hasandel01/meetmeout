import { useNavigate } from "react-router-dom";
import styles from "./Notifications.module.css";
import axiosInstance from "../../axios/axios";
import { useNotificationContext } from "../../context/NotificationContext";

const Notifications = () => {

  const navigate = useNavigate();
  const { notifications, fetchNotifications, selectedFilter, setSelectedFilter } = useNotificationContext();


    const handleNotificationStatus = async (notificationId: number, url: string) => { 
      
      try {
          await axiosInstance.put(`/notifications/status/${notificationId}`);
          await fetchNotifications();
      } catch (error) {
            console.error('Error fetching notifications:', error);
      }
        navigate(`${url}`)
    } 
  
  return (
    <div className={styles.notificationContainer}>
      <h2>Notifications</h2>
      <div className={styles.notificationDropdown}>
        <div className={styles.filterContainer}>
            <label htmlFor="filter">Filter by:</label>
            <select
              id="filter"
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
              }}
            >
              <option value="all">All</option>
              <option value="STARTED_EVENT">STARTED EVENT</option>
              <option value="FRIEND_REQUEST">FRIEND REQUEST</option>
              <option value="FRIEND_RESPONSE">FRIEND RESPONSE</option>
              <option value="EVENT_LIKE">EVENT LIKE</option>
              <option value="EVENT_INVITE">EVENT INVITE</option>
              <option value="EVENT_UPDATE">EVENT UPDATE</option>
              <option value="USER_KICKED">BEING KICKED</option>
              <option value="CAR_ADDED">CAR ADDED</option>
            </select>
        </div> 
        {notifications.length < 1 && <h2>There are no notifications for now. 🔕</h2>}
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