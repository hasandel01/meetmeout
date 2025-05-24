import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import axiosInstance from "../../../axios/axios";
import styles from "./../MainFeed.module.css";

const EventRatingStars = ({ eventId }: { eventId: number }) => {
    const [average, setAverage] = useState<number>(0);

    useEffect(() => {
        const fetchAverageRating = async () => {
            try {
                const response = await axiosInstance.get(`/events/${eventId}/average-rating`);
                if (response.status === 200) {
                    setAverage(response.data);
                } else {
                    toast.error("Error getting average rating");
                }
            } catch (error) {
                toast.error("Error getting average rating");
            }
        };

        fetchAverageRating();
    }, [eventId]);

    return (
        <div className={styles.eventRatings}>
            {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={styles.starIcon}
                    style={{ color: average >= star ? "gold" : "gray" }}
                />
            ))}
        </div>
    );
};


export default EventRatingStars;
