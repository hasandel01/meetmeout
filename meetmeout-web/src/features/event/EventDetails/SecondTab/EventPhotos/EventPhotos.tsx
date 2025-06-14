import styles from "./EventPhotos.module.css";
import React, { useState } from "react";
import { Event } from "../../../../../types/Event";
import { faTimes, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface EventPhotosProps {
  event: Event;
}

const EventPhotos: React.FC<EventPhotosProps> = ({ event }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openOverlay = (index: number) => setSelectedIndex(index);
  const closeOverlay = () => setSelectedIndex(null);

  const showPrev = () => setSelectedIndex((prev) => (prev! - 1 + event.eventPhotoUrls.length) % event.eventPhotoUrls.length);
  const showNext = () => setSelectedIndex((prev) => (prev! + 1) % event.eventPhotoUrls.length);

  return (
    <div className={styles.photoContainer}>
      <h4>Photos</h4>
          {Array.isArray(event.eventPhotoUrls) && event.eventPhotoUrls.length > 0 ? (
            <div className={styles.photoGrid}>
              {event.eventPhotoUrls.map((url, index) => (
                <img key={index} src={url} alt={`Photo ${index + 1}`} onClick={() => openOverlay(index)} />
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
                <img src={event.eventPhotoUrls[selectedIndex]} alt={`Preview ${selectedIndex + 1}`} />
                <FontAwesomeIcon icon={faChevronRight} className={styles.navIcon} onClick={showNext} />
              </div>
            </div>
          )}
          
    </div>
  );
};

export default EventPhotos;
