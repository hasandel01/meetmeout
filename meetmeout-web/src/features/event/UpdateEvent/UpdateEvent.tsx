import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../axios/axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const UpdateEvent = () => {
  const { eventId } = useParams(); 

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  });

  useEffect(() => {

    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get(`/events/${eventId}`);
        const { title, date, location, description } = response.data;
        setFormData({
          name: title,
          date,
          location,
          description,
        });
      } catch (error) {
        toast.error('Failed to fetch event data.');
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/events/${eventId}`, {
        title: formData.name,
        date: formData.date,
        location: formData.location,
        description: formData.description,
      });

      toast.success('Event updated successfully!');
      console.log(response.data);
    } catch (error) {
      toast.error('Failed to update event.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Update Event</h2>

      <div>
        <label htmlFor="name">Event Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Update Event</button>
    </form>
  );
};

export default UpdateEvent;
