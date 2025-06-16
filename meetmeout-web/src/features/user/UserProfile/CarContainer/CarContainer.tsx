import React, { useState } from 'react';
import styles from "./CarContainer.module.css";
import { Car } from '../../../../types/Car';
import axiosInstance from '../../../../axios/axios';
import { User } from '../../../../types/User';
import {toast} from "react-toastify";

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


    const handleDeleteCar = async (car: Car) => {

        if(await isCarAssigned(car)) return;

        try {
            await axiosInstance.delete(`/cars/${car.id}`);
            setLocalCars(prev => prev.filter(c => c.id !== car.id)); 
        } catch (error: any) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Car cannot be deleted. It may be linked to an event.");
            }
        }
    };


    const isCarAssigned = async (car: Car) => {
        try {
            const response = await axiosInstance.get(`/cars/${car.id}/delete-permission`)

            if(response.data) {
                toast.error("Car is assigned to an ongoing event. You can only delete cars used in completed or unassigned events.");
                return true;
            }

            return false;

        }catch(error) {
            console.log(error)
        }
    }


    return (
        <div className={styles.carContainer}>
            <h3>Your Cars</h3>
            <button className={styles.addButton} onClick={() => setShowModal(true)}>+ Add New Car</button>
            {localCars.map((car, index) => (
                <div key={index} className={styles.carCard}>
                    <div> 
                        <h4>{car.make} {car.model} (<strong>{car.year}</strong>)</h4>
                        <strong>Capacity: {car.capacity}</strong>

                    </div>
                    <button className={styles.deleteButton} onClick={() => handleDeleteCar(car)}>🗑 Delete</button>
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
                            max={25}
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
