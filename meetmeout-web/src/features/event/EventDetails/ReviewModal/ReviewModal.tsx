import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../../../../axios/axios";
import { User } from "../../../../types/User";
import styles from "./ReviewModal.module.css"
import { Event } from "../../../../types/Event";
import { useEffect, useRef, useState } from "react";
import { Review } from "../../../../types/Like";
import {toast} from 'react-toastify';


interface ReviewModalProps {
    event: Event;
    currentUser: User;
    setEvent: (event: Event | ((prev: Event) => Event)) => void;
    onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({event, currentUser, setEvent, onClose}) => {

    const [review, setReview] = useState<Review| null>(null);
    const popupRef = useRef<HTMLDivElement>(null);


    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {
            if(popupRef.current && !popupRef.current.contains(event.target as Node)) {
                    onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }

    },[])

    const handleAddReview = async () => {

        try {
        const response = await axiosInstance.post(`/review/${event.id}`, review);

        setEvent((prev: Event) => ({
            ...prev,
            reviews: [...prev.reviews, response.data]
        }))

        if(currentUser) {
            setReview({
            reviewId: 0,
            reviewer: currentUser,
            content: '',
            updatedAt: '',
            rating: 0
            });
        }

        } catch(error) {
            toast.error("Error adding review.");
        }

    }

    
    return (
        <div className={styles.reviewModal}>
             {(
              <div className={styles.reviewPopup} ref={popupRef}>
                <h4>Review</h4>
                <p>You were one of the attendees. Please share your thoughts about the event.</p>
                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesomeIcon
                      key={star}
                      icon={faStar}
                      className={styles.starIcon}
                      onClick={() => {
                            if (!currentUser) return;
                            setReview(prev => ({
                              reviewId: prev?.reviewId || 0,
                              reviewer: prev?.reviewer || currentUser,
                              content: prev?.content || "",
                              updatedAt: prev?.updatedAt || "",
                              rating: star
                            }));
                          }}
                      style={{ color: (review?.rating ?? 0) >= star ? "gold" : "gray" }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Write your review here..."
                  value={review?.content}
                  maxLength={400}
                  onChange={(e) => {
                    if (review) {
                      setReview({
                        reviewId: review.reviewId,
                        reviewer: review.reviewer,
                        updatedAt: review.updatedAt,
                        rating: review.rating,
                        content: e.target.value
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter')
                        handleAddReview()
                  }}
                ></textarea>
                <button onClick={() => handleAddReview()}>Submit Review</button>
              </div>
            )}
        </div>
    )

}

export default ReviewModal;