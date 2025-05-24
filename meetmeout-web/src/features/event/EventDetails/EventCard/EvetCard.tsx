import styles from "./EventCardDetails.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot, faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { Event } from "../../../../types/Event";
import { Weather } from "../../../../types/Forecast";
import { getCategoryIconLabel } from "../../../../mapper/CategoryMap";
import { User } from "../../../../types/User";

interface Props {
  event: Event;
  weather: Weather | null; 
  currentUser: User | null;
  options: Intl.DateTimeFormatOptions;
  handleLocationClick: () => void;
  handleLike: () => void;
}

const EventDetailsCard = ({
  event,
  weather,
  currentUser,
  options,
  handleLocationClick,
  handleLike
}: Props) => {

  const isMoreThan8DaysLater = (eventDateStr: string): boolean => {
    const today = new Date();
    const eventDate = new Date(eventDateStr);
    const diffInTime = eventDate.getTime() - today.getTime();
    const diffInDays = diffInTime / (1000 * 60 * 60 * 24);
    return diffInDays > 7;
  };

  const returnDayDifference = (): number => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    const diffInMs = eventDate.getDate() - today.getDate();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  return (
    <div className={styles.eventCardAndWeatherAPI}>
      <div className={styles.eventCard}>
        <div className={styles.firstColumn}>
          <img src={event.imageUrl} alt={event.title} />
          {weather && weather.current && (
            <div className={styles.weatherWidget}>
              <h4>How is the weather on the day of the event?</h4>
              <div className={styles.weatherContent}>
                {!isMoreThan8DaysLater(event.startDate) ? (
                  <div className={styles.weatherInfo}>
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
                      alt={weather.daily.at(returnDayDifference())?.summary}
                    />
                    <div>
                      <p>{weather.daily.at(returnDayDifference())?.temp.max.toFixed(0)}</p>
                      <p>{weather.daily.at(returnDayDifference())?.temp.min.toFixed(0)}</p>
                    </div>
                    <p>{weather.daily.at(returnDayDifference())?.summary}</p>
                  </div>
                ) : (
                  <div>
                    We can't provide you weather forecast for this time period. Weather forecast will be shown 8 days before the event date.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.secondColumn}>
          <div className={`${styles.eventStatus} ${styles[event.status]}`}>{event.status}</div>
          <div className={styles.eventTitle}>
            <div className={styles.eventCategory}>
              {(() => {
                const category = getCategoryIconLabel(event.category);
                return (
                  <span style={{ color: category.color }}>
                    {category.icon} {category.label}
                  </span>
                );
              })()}
            </div>
            <h2>{event.title}</h2>
          </div>
          <div className={styles.eventDetailsInfo}>
            <div className={styles.eventTimeDate}>
              <span>
                <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
                <p>
                  {new Date(event.startDate).toLocaleDateString("en-US", options)} <strong>&bull;</strong> {event.startTime} - {event.endTime}
                </p>
              </span>
            </div>
            <div className={styles.eventLocation} onClick={handleLocationClick}>
              <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
              <p>{event.addressName}</p>
            </div>
            <div className={styles.tags}>
              {event.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.eventActions}>
          <div className={styles.buttonGroup}>
            <FontAwesomeIcon
              icon={event.likes.some(u => u.username === currentUser?.username) ? faHeart : regularHeart}
              className={styles.heartIcon}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            />
            <span>{event.likes.length > 0 ? `${event.likes.length}` : ""}</span>
          </div>
          <div className={styles.buttonGroup}>
            <FontAwesomeIcon icon={faComment} className={styles.commentIcon} />
            <span>{event.comments.length > 0 ? `${event.comments.length}` : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsCard;