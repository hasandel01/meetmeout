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
        try {
            const response = await axiosInstance.post(`/cars/${user.id}/add`, newCar);
            console.log("NEW CAR IS ADDED", response.data);
            setLocalCars(prev => [...prev, response.data]);
            setShowModal(false);
            setNewCar({});
        } catch (error) {
            console.error("Car eklenemedi!", error);
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
                        <input type="text" placeholder="Make" value={newCar.make || ''} onChange={e => setNewCar({ ...newCar, make: e.target.value })} />
                        <input type="text" placeholder="Model" value={newCar.model || ''} onChange={e => setNewCar({ ...newCar, model: e.target.value })} />
                        <input type="number" placeholder="Year" value={newCar.year || ''} onChange={e => setNewCar({ ...newCar, year: parseInt(e.target.value) })} />
                        <input type="number" placeholder="Capacity" value={newCar.capacity || ''} onChange={e => setNewCar({ ...newCar, capacity: parseInt(e.target.value) })} />
                        
                        <div className={styles.modalActions}>
                            <button onClick={addCarToUser}>Save</button>
                            <button className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarContainer;
