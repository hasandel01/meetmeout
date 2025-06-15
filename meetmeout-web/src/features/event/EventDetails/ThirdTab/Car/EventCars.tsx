import {User} from "../../../../../types/User";
import { Event } from "../../../../../types/Event";
import styles from "./EventCars.module.css";
import { useState } from "react";
import axiosInstance from "../../../../../axios/axios";
import { Car } from "../../../../../types/Car";
import { EventCar } from "../../../../../types/Car";
import {toast} from 'react-toastify';

interface EventCarsProps {
    currentUser: User;
    event: Event;
    eventCars: EventCar[];
} 

const EventCars: React.FC<EventCarsProps> = ({ currentUser, event, eventCars }) => {
    const [showCarsModal, setShowCarsModal] = useState(false);
    const [selectedCars, setSelectedCars] = useState<Car[]>([]);

    const handleSelectCar = (car: Car) => {
        const alreadySelected = selectedCars.find(c => c.id === car.id);
        if (alreadySelected) {
            setSelectedCars(selectedCars.filter(c => c.id !== car.id));
        } else {
            setSelectedCars([...selectedCars, car]);
        }
    };

    const isUserAttendee = event.attendees.some(att => att.username === currentUser?.username);
    const availableCars = currentUser?.cars?.filter(
        car => !eventCars.some(eventCar => eventCar.car.id === car.id)
    ) || [];


    const handleJoinWithCars = async () => {
        if (selectedCars.length === 0) return;

        try {
            const isOrganizer = currentUser.username === event.organizer?.username;

            const url = isOrganizer
            ? `/events/car/${event.id}/add` 
            : `/events/car/${event.id}/request`; 

            await axiosInstance.post(url, selectedCars);
            toast.success(isOrganizer ? "Car(s) added!" : "Request sent for approval.");

        } catch (error) {
            console.error("Car join error:", error);
        }
    };

    return (
        <div className={styles.eventCarsContainer}>
            {event.attendees.length > 0 && isUserAttendee && availableCars.length > 0 ? (
                <>                    
                    <label onClick={() => setShowCarsModal(prev => !prev)}>
                        🚗 Do you want to use your car(s) in this event?
                    </label>
                    {showCarsModal && (
                        <div className={styles.carList}>
                            {availableCars.map(car => (
                                <div
                                    key={car.id}
                                    className={`${styles.carCard} ${selectedCars.some(c => c.id === car.id) ? styles.selected : ""}`}
                                    onClick={() => handleSelectCar(car)}
                                >
                                    <h4>{car.make} {car.model}</h4>
                                    <p>Year: {car.year}</p>
                                    <p>Capacity: {car.capacity}</p>
                                </div>
                            ))}
                            <button
                                className={styles.joinWithCarButton}
                                onClick={handleJoinWithCars}
                                disabled={selectedCars.length === 0}
                            >
                                Join with Selected Car(s)
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p> You don't have any car to assign to this event.</p>
            )}
        </div>
    );
};

export default EventCars;
