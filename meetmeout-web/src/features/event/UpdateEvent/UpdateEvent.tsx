import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Event } from '../../../types/Event';
import styles from './UpdateEvent.module.css';

const UpdateEvent = () => {

  const { eventId } = useParams(); 
  const [updatedEvent, setUpdatedEvent] = useState<Event | undefined>(undefined);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get(`/events/${eventId}`);
        setUpdatedEvent(response.data);
      } catch (error) {
        toast.error('Failed to fetch event data.');
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);
    

  const dateNow = new Date();
  const start = new Date(`${updatedEvent?.startDate}T${updatedEvent?.startTime}`)
  const end = new Date(`${updatedEvent?.endDate}T${updatedEvent?.endTime}`);

  const diffToStart = (start.getTime() - dateNow.getTime()) / 60000;

  const isFullyEditable = diffToStart > 15;
  const isPartiallyEditable = dateNow >= start && dateNow <= end;

  useEffect(() => {

    const updateEvent = async () => {
      try {
        const response = await axiosInstance.put(`/events/${eventId}`, updatedEvent);

        setUpdatedEvent(response.data);
      } catch (error) {
        toast.error('Failed to fetch event data.');
      }
    };

    if (eventId) updateEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUpdatedEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/events/${eventId}`, {
        updatedEvent
      });

      toast.success('Event updated successfully!');
      console.log(response.data);
    } catch (error) {
      toast.error('Failed to update event.');
    }
  };

  return (
    <form  className={styles.form} onSubmit={handleSubmit}>
      <h4>Update Event</h4>
      {isFullyEditable && <p>You can update all details of this event. 🚴‍♂️</p>}
      {isPartiallyEditable && <p>Only the description and end time can be updated at this time. 🚶‍♂️</p>}
        <input
          type="file"
          id="imageUrl"
          name="imageUrl"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setUpdatedEvent((prev) => ({ ...prev, imageUrl: reader.result as string }));
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <input
          type="text"
          id="name"
          name="name"
          placeholder='Event Title'
          value={updatedEvent?.title}
          onChange={handleChange}
          required
        />
        <textarea
          id="description"
          name="description"
          placeholder='Event Description'
          value={updatedEvent?.description}
          onChange={handleChange}
          required
          />

        <input
          type="date"
          id="date"
          name="date"
          value={updatedEvent?.startDate}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          id="endDate"
          name="endDate"
          value={updatedEvent?.endDate}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          id="startTime"
          name="startTime"
          value={updatedEvent?.startTime}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          id="endTime"
          name="endTime"
          value={updatedEvent?.endTime}
          onChange={handleChange}
          required 
        />
        
      <div>
        <label htmlFor="location"> Change Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={updatedEvent?.addressName}
          onChange={handleChange}
          required
        />
      </div>


      <button type="submit">Update Event</button>
    </form>
  );
};

export default UpdateEvent;
