import React, { useEffect, useState } from "react";
import styles from "./EventCars.module.css";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Event } from "../../../../../types/Event";
import { EventCar } from "../../../../../types/Car";
import { User } from "../../../../../types/User";
import axiosInstance from "../../../../../axios/axios";

interface CarAssignmentBoardProps {
    event: Event;
    currentUser: User;
}

const CarAssignmentBoard: React.FC<CarAssignmentBoardProps> = ({ event, currentUser }) => {
    const [unassigned, setUnassigned] = useState<User[]>([]);
    const [eventCars, setEventCars] = useState<EventCar[]>([]);
    const [assignments, setAssignments] = useState<Record<number, User[]>>({});

    const getEventCars = async () => {
        try {
            const response = await axiosInstance.get(`/events/car/${event.id}`);
            setEventCars(response.data);

            const map: Record<number, User[]> = {};
            response.data.forEach((ec: EventCar) => {
                map[ec.id] = ec.passengers ?? [];
            });
            setAssignments(map);

            const assignedIds = new Set(response.data.flatMap((ec: EventCar) => ec.passengers.map(p => p.id)));
            const notAssigned = event.attendees.filter(att => !assignedIds.has(att.id));
            setUnassigned(notAssigned);
        } catch (error) {
            console.error("Error fetching event cars", error);
        }
    };

    useEffect(() => {
        if (event) getEventCars();
    }, [event]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const draggedId = parseInt(draggableId);

        if (source.droppableId === "unassigned") {
            const draggedUser = unassigned.find(u => u.id === draggedId);
            if (!draggedUser) return;

            const carId = parseInt(destination.droppableId);
            const cap = eventCars.find(ec => ec.id === carId)?.car.capacity ?? 0;

            if (assignments[carId]?.length >= cap) return;

            setUnassigned(prev => prev.filter(u => u.id !== draggedId));
            setAssignments(prev => ({ ...prev, [carId]: [...prev[carId], draggedUser] }));
        } else {
            const sourceCarId = parseInt(source.droppableId);
            const draggedUser = assignments[sourceCarId].find(u => u.id === draggedId);
            if (!draggedUser) return;

            if (destination.droppableId === "unassigned") {
                setAssignments(prev => ({ ...prev, [sourceCarId]: prev[sourceCarId].filter(u => u.id !== draggedId) }));
                setUnassigned(prev => [...prev, draggedUser]);
            } else {
                const targetCarId = parseInt(destination.droppableId);
                const cap = eventCars.find(ec => ec.id === targetCarId)?.car.capacity ?? 0;

                if (assignments[targetCarId]?.length >= cap) return;

                setAssignments(prev => ({
                    ...prev,
                    [sourceCarId]: prev[sourceCarId].filter(u => u.id !== draggedId),
                    [targetCarId]: [...prev[targetCarId], draggedUser]
                }));
            }
        }
    };

    const handleSave = async () => {
    try {
        for (const [eventCarId, passengers] of Object.entries(assignments)) {
            const passengerIds = passengers.map(p => p.id);

            await axiosInstance.post(`/events/car/${eventCarId}/passengers`, passengerIds);
        }
        alert("Saved!");
    } catch (error) {
        console.error("Save failed", error);
    }
};



    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={styles.board}>
                <Droppable droppableId="unassigned">
                    {(provided) => (
                        <div className={styles.unassigned} ref={provided.innerRef} {...provided.droppableProps}>
                            <h3>Unassigned Attendees</h3>
                            {unassigned.map((user, index) => (
                                <Draggable draggableId={user.id.toString()} index={index} key={user.id}>
                                    {(provided) => (
                                        <div className={styles.userCard} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            <img src={user.profilePictureUrl} />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                <div className={styles.cars}>
                    {eventCars.map(eventCar => (
                        <Droppable droppableId={eventCar.id.toString()} key={eventCar.id}>
                            {(provided) => (
                                <div className={styles.carColumn} ref={provided.innerRef} {...provided.droppableProps}>
                                    <h4>{eventCar.car.make} {eventCar.car.model} ({eventCar.car.capacity})</h4>
                                    {assignments[eventCar.id]?.map((user, index) => (
                                        <Draggable draggableId={user.id.toString()} index={index} key={user.id}>
                                            {(provided) => (
                                                <div className={styles.userCard} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <img src={user.profilePictureUrl} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </div>
            <button onClick={handleSave} className={styles.saveButton}>💾 Save Assignments</button>
        </DragDropContext>
    );
};

export default CarAssignmentBoard;
