import { Review } from "../../../../../types/Like";
import styles from "./EventReviews.module.css";
import {faPenToSquare, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import formatTime from "../../../../../utils/formatTime";
import { User } from "../../../../../types/User";

interface ReviewProps {
    reviews: Review[];
    currentUser: User;
    handleEditReview: (review: any) => void;
    handleDeleteReview: (review: any) => void;
}

const EventReviews: React.FC<ReviewProps> = ({reviews, currentUser, handleDeleteReview, handleEditReview }) => {

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
                              onClick={() => handleEditReview(review)}
                              title="Edit"
                            />
                            <FontAwesomeIcon
                              icon={faTrash}
                              className={styles.deleteIcon}
                              onClick={() => handleDeleteReview(review)}
                              title="Delete"
                            />
                          </div>
                        )}
                      </div>
                    ))
                  )}
            </div>
    )

}

export default EventReviews;