import { User } from "../../../../types/User";
import { useState } from "react";
import axiosInstance from "../../../../axios/axios";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import styles from "./UserReviewModal.module.css";
import { Event } from "../../../../types/Event";
import { useEffect, useRef } from "react";

interface UserReviewModalProps {
  event: Event;
  currentUser: User;
  onClose: () => void;
}

const UserReviewModal: React.FC<UserReviewModalProps> = ({ event, currentUser, onClose }) => {
  
  const [review, setReview] = useState<{ rating: number; review: string }>({ rating: 0, review: "" });

  const handleSubmit = async () => {
    try {
      await axiosInstance.post(`/user-reviews/event/${event.id}/to/${event.organizer?.id}/by/${currentUser.id}`, {
        review: review.review,
        rating: review.rating,   
      });

      toast.success("Organizer review submitted!");
      onClose();
    } catch (err) {
      toast.error("Failed to submit organizer review");
    }
  };

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className={styles.reviewModal}>
      <div className={styles.reviewPopup} ref={popupRef}>
        <h4>Organizer Review</h4>
        <p>{event.organizer?.firstName} {event.organizer?.lastName} için değerlendirmenizi bırakın:</p>

        <div className={styles.reviewStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              onClick={() => setReview(prev => ({ ...prev, rating: star }))}
              style={{ color: (review.rating) >= star ? "gold" : "gray", cursor: "pointer" }}
            />
          ))}
        </div>

        <textarea
          maxLength={300}
          placeholder="Görüşünüzü yazın..."
          value={review.review}
          onChange={(e) => setReview(prev => ({ ...prev, review: e.target.value }))}
        />

        <button onClick={handleSubmit}>Gönder</button>
      </div>
    </div>
  );
};

export default UserReviewModal;
