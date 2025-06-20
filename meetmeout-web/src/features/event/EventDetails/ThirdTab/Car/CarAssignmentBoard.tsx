import React, { useEffect, useState } from "react";
import styles from "./CarAssignmentBoard.module.css";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Event } from "../../../../../types/Event";
import { EventCar } from "../../../../../types/Car";
import { User } from "../../../../../types/User";
import axiosInstance from "../../../../../axios/axios";
import EventCars from "./EventCars";
import PendingCarRequests from "./PendingCarRequests";
import { toast } from "react-toastify";

interface CarAssignmentBoardProps {
  event: Event;
  currentUser: User;
}

const CarAssignmentBoard: React.FC<CarAssignmentBoardProps> = ({ event, currentUser }) => {
  const [unassigned, setUnassigned] = useState<User[]>([]);
  const [eventCars, setEventCars] = useState<EventCar[]>([]);
  const [assignments, setAssignments] = useState<Record<number, User[]>>({});
  const [carToRemove, setCarToRemove] = useState<EventCar | null>(null);

  const isOrganizer = currentUser.username === event.organizer?.username;

  const handleRemoveClick = (eventCar: EventCar) => {
    setCarToRemove(eventCar);
  };

  const handleConfirmRemove = async () => {
    if (!carToRemove) return;
    try {
      await axiosInstance.delete(`/events/car/${carToRemove.id}`);
      setCarToRemove(null);
      getEventCars();
    } catch (err) {
      console.error("Error when deleting:", err);
    }
  };

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


  useEffect(() => {
  if (!eventCars.length) return;

  const newAssignments: Record<number, User[]> = {};

  eventCars.forEach((car) => {
    newAssignments[car.id] = assignments[car.id] ?? [];
  });

  setAssignments(newAssignments);

  const assignedIds = new Set(Object.values(newAssignments).flat().map(u => u.id));
  const notAssigned = event.attendees.filter(att => !assignedIds.has(att.id));
  setUnassigned(notAssigned);
}, [eventCars]);



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
      setAssignments(prev => ({
        ...prev,
        [carId]: [...(prev[carId] ?? []), draggedUser]
      }));
    } else {
      const sourceCarId = parseInt(source.droppableId);
      const draggedUser = assignments[sourceCarId].find(u => u.id === draggedId);
      if (!draggedUser) return;

      if (destination.droppableId === "unassigned") {
        setAssignments(prev => ({
          ...prev,
          [sourceCarId]: prev[sourceCarId].filter(u => u.id !== draggedId)
        }));
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
      toast.success("Assignments saved successfully! 🚗");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save assignments. Please try again.");
    }
  };

  if (!event.attendees.some(att => att.username === currentUser.username)) {
    return <p className={styles.attendeeWarning}>ℹ️ Event car assignments are only available for attendees.</p>;
  }

  return (
    <div>
      {isOrganizer ? (
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
              {eventCars.map(eventCar => {
                const isOwner = eventCar.car.userId === currentUser.id;
                return (
                  <Droppable droppableId={eventCar.id.toString()} key={eventCar.id}>
                    {(provided) => (
                      <div className={styles.carColumn} ref={provided.innerRef} {...provided.droppableProps}>
                        <h4>
                          {eventCar.car.make} {eventCar.car.model}
                          {isOwner && (
                            <button className={styles.removeBtn} onClick={() => handleRemoveClick(eventCar)}>❌</button>
                          )}
                        </h4>
                        <div className={styles.slotContainer}>
                          {Array.from({ length: eventCar.car.capacity }).map((_, i) => {
                            const user = assignments[eventCar.id]?.[i];
                            return (
                              <Draggable
                                key={user?.id ?? `empty-${i}`}
                                draggableId={user ? user.id.toString() : `empty-${eventCar.id}-${i}`}
                                index={i}
                                isDragDisabled={!user}
                              >
                                {(provided) => (
                                  <div
                                    className={styles.carSlot}
                                    ref={provided.innerRef}
                                    {...(user ? provided.draggableProps : {})}
                                    {...(user ? provided.dragHandleProps : {})}
                                  >
                                    {user && <img src={user.profilePictureUrl} />}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </div>
          <button onClick={handleSave} className={styles.saveButton}>💾 Save Assignments</button>
        </DragDropContext>
      ) : (
        <div className={styles.board}>
          <div className={styles.unassignedReadonly}>
            <h3>Unassigned Attendees</h3>
            {unassigned.map(user => (
              <div key={user.id} className={styles.userCard}>
                <img src={user.profilePictureUrl} />
              </div>
            ))}
          </div>
          <div className={styles.cars}>
            {eventCars.map(eventCar => {
              const isOwner = eventCar.car.userId === currentUser.id;
              return (
                <div key={eventCar.id} className={styles.carColumn}>
                  <h4>
                    {eventCar.car.make} {eventCar.car.model} ({eventCar.car.year})
                    {isOwner && (
                      <button className={styles.removeBtn} onClick={() => handleRemoveClick(eventCar)}>❌</button>
                    )}
                  </h4>
                  <div className={styles.slotContainer}>
                    {assignments[eventCar.id]?.map(user => (
                      <div key={user.id} className={styles.userCard}>
                        <img src={user.profilePictureUrl} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {carToRemove && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Are you sure to remove the car from the event?</h3>
            {assignments[carToRemove.id]?.length > 0 && (
              <p>🚨 This car holds {assignments[carToRemove.id].length} assigned passengers.</p>
            )}
            <div className={styles.modalButtons}>
              <button onClick={handleConfirmRemove}>Yes</button>
              <button onClick={() => setCarToRemove(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <EventCars
        eventCars={eventCars}
        currentUser={currentUser}
        event={event}
        onOptimisticCarAdd={(newCars) => {
          setEventCars(prev => [...prev, ...newCars]);
        }}
      />

      <PendingCarRequests event={event} />
    </div>
  );
};

export default CarAssignmentBoard;
