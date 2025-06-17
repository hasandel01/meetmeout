import styles from "./EventPhotos.module.css";
import React, { useState } from "react";
import { Event } from "../../../../../types/Event";
import { faTimes, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatTime from "../../../../../utils/formatTime";
import { useNavigate } from "react-router-dom";

interface EventPhotosProps {
  event: Event;
}

const EventPhotos: React.FC<EventPhotosProps> = ({ event }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openOverlay = (index: number) => setSelectedIndex(index);
  const closeOverlay = () => setSelectedIndex(null);
  const navigate = useNavigate();

  const showPrev = () => setSelectedIndex((prev) => (prev! - 1 + event.eventPhotos.length) % event.eventPhotos.length);
  const showNext = () => setSelectedIndex((prev) => (prev! + 1) % event.eventPhotos.length);

  return (
    <div className={styles.photoContainer}>
      <h4>Photos</h4>
          {Array.isArray(event.eventPhotos) && event.eventPhotos.length > 0 ? (
            <div className={styles.photoGrid}>
              <div>
              </div>
                {event.eventPhotos.map((photo, index) => (
                  <div key={index} className={styles.photoCard}>
                    <div className={styles.uploaderInfo}>
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className={styles.photo}
                        onClick={() => openOverlay(index)}
                      />
                      <img
                        src={photo.uploadedByProfilePictureUrl}
                        alt={photo.uploadedByUsername}
                        className={styles.avatar}
                        title={photo.uploadedByUsername}
                        onClick={() => navigate(`/user-profile/${photo.uploadedByUsername}`)}
                      />
                    </div>
                    <p>{photo.uploadedDateTime && formatTime(photo.uploadedDateTime)}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>No photos yet.</p>
          )}
          {selectedIndex !== null && (
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <FontAwesomeIcon icon={faTimes} className={styles.closeIcon} onClick={closeOverlay} />
                <FontAwesomeIcon icon={faChevronLeft} className={styles.navIcon} onClick={showPrev} />
                <img src={event.eventPhotos[selectedIndex].url} alt={`Preview ${selectedIndex + 1}`} />
                <FontAwesomeIcon icon={faChevronRight} className={styles.navIcon} onClick={showNext} />
              </div>
            </div>
          )}
          
    </div>
  );
};

export default EventPhotos;
