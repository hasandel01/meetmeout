import React, { useState } from 'react';
import styles from "./CarContainer.module.css";
import { Car } from '../../../../types/Car';
import axiosInstance from '../../../../axios/axios';
import { User } from '../../../../types/User';

interface CarContainerProps {
    cars: Car[];
    user: User;
}

const CarContainer: React.FC<CarContainerProps> = ({ cars, user }) => {
    const [newCar, setNewCar] = useState<Partial<Car>>({});
    const [showModal, setShowModal] = useState(false);
    const [localCars, setLocalCars] = useState<Car[]>(cars);

    const addCarToUser = async () => {
        const currentYear = new Date().getFullYear();

        if (!newCar.make || newCar.make.length < 2 || newCar.make.length > 20) {
            alert("Make must be between 2 and 20 characters.");
            return;
        }

        if (!newCar.model || newCar.model.length < 2 || newCar.model.length > 20) {
            alert("Model must be between 2 and 20 characters.");
            return;
        }

        if (!newCar.year || newCar.year < 1900 || newCar.year > currentYear) {
            alert(`Year must be between 1900 and ${currentYear}.`);
            return;
        }

        if (!newCar.capacity || newCar.capacity < 2 || newCar.capacity > 20) {
            alert("Capacity must be between 2 and 20.");
            return;
        }

        try {
            const response = await axiosInstance.post(`/cars/${user.id}/add`, newCar);
            setLocalCars(prev => [...prev, response.data]);
            setShowModal(false);
            setNewCar({});
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div className={styles.carContainer}>
            <h3>Your Cars</h3>
            <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Add New Car</button>

            {localCars.map((car, index) => (
                <div key={index} className={styles.carCard}>
                    <p><strong>Make:</strong> {car.make}</p>
                    <p><strong>Model:</strong> {car.model}</p>
                    <p><strong>Year:</strong> {car.year}</p>
                    <p><strong>Capacity:</strong> {car.capacity}</p>
                </div>
            ))}

            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h4>Add New Car</h4>
                        <input
                            type="text"
                            placeholder="Make"
                            value={newCar.make || ''}
                            onChange={e => setNewCar({ ...newCar, make: e.target.value })}
                            />
                        <input
                            type="text"
                            placeholder="Model"
                            value={newCar.model || ''}
                            onChange={e => setNewCar({ ...newCar, model: e.target.value })}
                            />
                        <input
                            type="number"
                            placeholder="Year"
                            min={1900}
                            max={new Date().getFullYear()}
                            value={newCar.year || ''}
                            onChange={e => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                            />
                        <input
                            type="number"
                            placeholder="Capacity"
                            min={2}
                            max={20}
                            value={newCar.capacity || ''}
                            onChange={e => setNewCar({ ...newCar, capacity: parseInt(e.target.value) })}
                            />
                        <div className={styles.modalActions}>
                            <button className={styles.saveButton}onClick={addCarToUser}>Save</button>
                            <button className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarContainer;
