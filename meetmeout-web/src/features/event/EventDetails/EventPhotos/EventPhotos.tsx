import styles from "./EventPhotos.module.css"

import React from "react";
import { Event } from "../../../../types/Event";

interface EventPhotosProps {
    event: Event;
}

const EventPhotos: React.FC<EventPhotosProps> = ({event}) => {

    return (
          <div className={styles.photoContainer}>
              <h4>Photos</h4>
                <div className={styles.photoGrid}>
                {event.eventPhotoUrls && event.eventPhotoUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Photo ${index + 1}`} />
                  ))}
                </div>
          </div>
    )
}

export default EventPhotos;