import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Event } from '../../../types/Event';
import { RouteType } from '../../../types/RouteType';
import styles from './UpdateEvent.module.css';


const UpdateEvent = () => {
  const { eventId } = useParams(); 


  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get(`/events/${eventId}`);
        setFormData(response.data);
      } catch (error) {
        toast.error('Failed to fetch event data.');
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  

  const [formData, setFormData] = useState<Event>({
            id: 1,
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            startTime: '',
            endTime: '',
            imageUrl: "https://res.cloudinary.com/droju2iga/image/upload/v1746880197/default_event_wg5tsm.png",
            tags: [],
            isPrivate: false,
            isDraft: false,
            maximumCapacity: 1,
            status: 'ONGOING',
            attendees: [],
            organizer: null,
            addressName: '',
            endAddressName: '',
            category: '',
            longitude: 0,
            latitude: 0,
            likes: [],
            comments: [],
            reviews: [],
            createdAt: '',
            isThereRoute: false,
            isCapacityRequired: false,
            isFeeRequired: false,
            fee: 0,
            endLatitude: 0,
            endLongitude: 0,
            feeDescription: '',
            routeType: RouteType.CAR,
            eventPhotoUrls: []
  });

  useEffect(() => {

    const updateEvent = async () => {
      try {
        const response = await axiosInstance.put(`/events/${eventId}`, formData);

        setFormData(response.data);
      } catch (error) {
        toast.error('Failed to fetch event data.');
      }
    };

    if (eventId) updateEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/events/${eventId}`, {
        formData
      });

      toast.success('Event updated successfully!');
      console.log(response.data);
    } catch (error) {
      toast.error('Failed to update event.');
    }
  };

  return (
    <form  className={styles.form} submit={handleSubmit}>
      <h2>Update Event</h2>
      
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
                setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
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
          value={formData.title}
          onChange={handleChange}
          required
        />
        
        <textarea
          id="description"
          name="description"
          placeholder='Event Description'
          value={formData.description}
          onChange={handleChange}
          required
          />

        <input
          type="date"
          id="date"
          name="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          id="location"
          name="location"
          value={formData.endDate}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          id="startTime"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          id="endTime"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required 
        />
        
      <div>
        <label htmlFor="location"> Change Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.addressName}
          onChange={handleChange}
          required
        />
      </div>


      <button type="submit">Update Event</button>
    </form>
  );
};

export default UpdateEvent;
