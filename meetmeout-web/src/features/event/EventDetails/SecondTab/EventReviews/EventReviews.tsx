import { Review } from "../../../../../types/Like";
import styles from "./EventReviews.module.css";
import {faPenToSquare, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatTime from "../../../../../utils/formatTime";
import { User } from "../../../../../types/User";
import axiosInstance from "../../../../../axios/axios";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import {toast} from 'react-toastify'
import { Event } from "../../../../../types/Event";


interface ReviewProps {
    reviews: Review[];
    currentUser: User;
    event: Event;
    setEvent: Dispatch<SetStateAction<Event>>;
}

const EventReviews: React.FC<ReviewProps> = ({reviews, currentUser, setEvent }) => {

      const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false);
      const [showEditReviewModal, setShowEditReviewModal] = useState(false);
      const [editContent, setEditContent] = useState("");
      const [editRating, setEditRating] = useState(0);
      const [selectedReview, setSelectedReview] = useState<Review | null>(null);


      const handleDeleteReview = async (review: Review) => {
        
        try {

          await axiosInstance.delete(`/review/${review.reviewId}`);
          
          setEvent(prev => ({
            ...prev,
            reviews: prev.reviews.filter(r => r.reviewId !== review.reviewId)
          }))

        }catch(error) {
          toast.error("Error deleting review.");
        }
    }

    const handleEditReview = async (review: Review) => {
      
      try {

        const response = await axiosInstance.put(`/review/${review.reviewId}`, review);

        setEvent(prev => ({
          ...prev,
          reviews: prev.reviews.map(r => r.reviewId === review.reviewId ? response.data : r)
        }))


      }catch(error) {
        toast.error("Error editing review.");
      }
    }


    const modalRef = useRef<HTMLDivElement>(null);
    
        useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setShowDeleteReviewModal(false);
            }
        };
    
        if (showDeleteReviewModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
        }, [showDeleteReviewModal]);


    return (
        <div className={styles.reviewContainer}>
            <h4> Reviews</h4>
            {reviews.length === 0 ? (
              <p className={styles.emptyMessage}>No reviews yet.</p>
            ) :(
            reviews.map((review, index) => ( 
                <div key={index} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                        <div className={styles.senderInfo}>
                            <img src={review.reviewer.profilePictureUrl} alt="User Avatar" />
                            <span className={styles.username}>{review.reviewer.username}</span>
                          </div>
                          <span className={styles.timestamp}>{formatTime(review.updatedAt)}</span>
                        </div>
                        <div className={styles.reviewContent}>
                          <p>{review.content}</p>
                          <div className={styles.reviewStars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={faStar}
                                className={styles.starIcon}
                                style={{ color: review.rating >= star ? "gold" : "gray" }}
                              />
                            ))}
                          </div>
                        </div>
                        {review.reviewer.username === currentUser?.username && (
                          <div className={styles.reviewActions}>
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className={styles.actionIcon}
                              onClick={() => {
                                    setSelectedReview(review);
                                    setEditContent(review.content);
                                    setEditRating(review.rating);
                                    setShowEditReviewModal(true);
                                  }}
                              title="Edit"
                            />
                            <FontAwesomeIcon
                              icon={faTrash}
                              className={styles.deleteIcon}
                              onClick={() => setShowDeleteReviewModal(prev => !prev)}
                              title="Delete"
                            />
                          </div>
                        )}
                        {showEditReviewModal && 
                          <div className={styles.reviewModalOverlay}>
                            <div className={styles.reviewModal} ref={modalRef}>
                              <h4>Edit your review</h4>
                              <textarea
                                className={styles.editTextarea}
                                value={editContent}
                                maxLength={300}
                                minLength={1}
                                onChange={(e) => setEditContent(e.target.value)}
                              />
                              <div className={styles.starSelector}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FontAwesomeIcon
                                    key={star}
                                    icon={faStar}
                                    className={styles.starIcon}
                                    style={{ color: editRating >= star ? "gold" : "gray", cursor: "pointer" }}
                                    onClick={() => setEditRating(star)}
                                  />
                                ))}
                              </div>
                              <div className={styles.reviewModalButtons}>
                                <button
                                  className={styles.confirmButton}
                                  onClick={() => {
                                    if (selectedReview && typeof selectedReview.reviewId === "number") {
                                      handleEditReview({
                                        ...selectedReview,
                                        content: editContent,
                                        rating: editRating,
                                        reviewId: selectedReview.reviewId,
                                        reviewer: selectedReview.reviewer,
                                        updatedAt: new Date().toISOString(),
                                        isDismissed: selectedReview.isDismissed ?? false
                                      });
                                    }
                                    setShowEditReviewModal(false);
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  className={styles.cancelButton}
                                  onClick={() => setShowEditReviewModal(false)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>}
                        {showDeleteReviewModal && 
                                  <div className={styles.deleteEventModalOverlay}>
                                    <div className={styles.deleteEventModal} ref={modalRef}>
                                        <h4> 
                                          Are you sure to delete you review for this event?
                                        </h4>
                                        <div className={styles.deleteEventModalButtons}>
                                            <button
                                            className={styles.confirmButton}
                                            onClick={() => {
                                                setShowDeleteReviewModal(false);
                                                handleDeleteReview(review);
                                            }}
                                            >
                                            Yes
                                            </button>
                                            <button
                                            className={styles.cancelButton}
                                            onClick={() => setShowDeleteReviewModal(false)}
                                            >
                                            Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                        }
                      </div>
                    ))
                  )}
            </div>
    )

}

export default EventReviews;