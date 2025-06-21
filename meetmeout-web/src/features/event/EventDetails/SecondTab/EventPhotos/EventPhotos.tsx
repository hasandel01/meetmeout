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

  const showPrev = () =>
    setSelectedIndex((prev) => (prev! - 1 + event.eventPhotos.length) % event.eventPhotos.length);
  const showNext = () =>
    setSelectedIndex((prev) => (prev! + 1) % event.eventPhotos.length);

  const groupedPhotos = event.eventPhotos.reduce((acc, photo) => {
    const username = photo.uploadedByUsername;
    if (!acc[username]) acc[username] = [];
    acc[username].push(photo);
    return acc;
  }, {} as Record<string, typeof event.eventPhotos>);

  return (
    <div className={styles.photoContainer}>
      <h4>Photos</h4>
      {Object.keys(groupedPhotos).length > 0 ? (
        <div className={styles.groupedPhotoGrid}>
          {Object.entries(groupedPhotos).map(([username, photos]) => (
            <div key={username} className={styles.userPhotoGroup}>
              <div className={styles.userInfoRow}>
                <img
                  src={photos[0].uploadedByProfilePictureUrl}
                  alt={username}
                  className={styles.avatar}
                  title={username}
                  onClick={() => navigate(`/user-profile/${username}`)}
                />
                <span className={styles.username}>{username}</span>
              </div>
              <div className={styles.userPhotoGrid}>
                {photos.map((photo) => {
                  const globalIndex = event.eventPhotos.findIndex(p => p.url === photo.url);
                  return (
                    <div key={photo.url} className={styles.photoCard}>
                      <img
                        src={photo.url}
                        alt={`Photo`}
                        className={styles.photo}
                        onClick={() => openOverlay(globalIndex)}
                      />
                      <p>{photo.uploadedDateTime && formatTime(photo.uploadedDateTime)}</p>
                    </div>
                  );
                })}
              </div>
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
            <img
              src={event.eventPhotos[selectedIndex].url}
              alt={`Preview ${selectedIndex + 1}`}
            />
            <FontAwesomeIcon icon={faChevronRight} className={styles.navIcon} onClick={showNext} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPhotos;

