import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../../axios/axios";
import { Event } from "../../../../../types/Event";
import { EventCar } from "../../../../../types/Car";
import { User } from "../../../../../types/User";
import styles from "./PendingCarRequests.module.css";

interface Props {
  event: Event;
}

interface EnrichedEventCar extends EventCar {
  owner?: User;
}

const PendingCarRequests: React.FC<Props> = ({ event }) => {
  const [pendingCars, setPendingCars] = useState<EnrichedEventCar[]>([]);

  const fetchPendingCars = async () => {
    try {
      const response = await axiosInstance.get(`/events/car/${event.id}`);
      const rawPending: EventCar[] = response.data.filter((ec: EventCar) => !ec.approved);

      const ownerIds = rawPending.map((ec) => ec.car.userId);
      const usersResponse = await axiosInstance.get("/users", {
        params: { ids: ownerIds.join(",") },
      });

      const users: User[] = usersResponse.data;

      const enriched: EnrichedEventCar[] = rawPending.map((ec) => {
        const owner = users.find((u) => u.id === ec.car.userId);
        return { ...ec, owner };
      });

      setPendingCars(enriched);
    } catch (err) {
      console.error("Error loading pending cars or owners:", err);
    }
  };

  const handleApprove = async (eventCarId: number) => {
    try {
      await axiosInstance.put(`/events/car/${eventCarId}/approve`);
      setPendingCars((prev) => prev.filter((pc) => pc.id !== eventCarId));
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  useEffect(() => {
    fetchPendingCars();
  }, [event.id]);

  if (pendingCars.length === 0) return null;

  return (
    <div className={styles.pendingContainer}>
      <h3>🚗 Pending Car Requests</h3>
      {pendingCars.map((ec) => (
        <div key={ec.id} className={styles.pendingCard}>
          <div>
            <strong>{ec.car.make} {ec.car.model}</strong> ({ec.car.capacity} kişilik)
          </div>
          <div>
            👤 {ec.owner
              ? `${ec.owner.firstName} ${ec.owner.lastName} (@${ec.owner.username})`
              : `User ID: ${ec.car.userId}`}
          </div>
          <button onClick={() => handleApprove(ec.id)}>✅ Onayla</button>
        </div>
      ))}
    </div>
  );
};

export default PendingCarRequests;
