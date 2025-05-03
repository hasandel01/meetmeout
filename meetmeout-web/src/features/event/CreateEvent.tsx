import React, { useState } from 'react';
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from '../axios/axios';
import { Event } from '../types/Event';
import EventLocationSelector from '../map/EventLocationSelector';
import "../styles/CreateEvent.css";
import axios from 'axios';

const CreateEvent = () => {

    const [event, setEvent] = useState<Event | null>(null);
    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number} | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [addressName, setAddressName] = useState<string | null>(null);

    const defaultEventUrl = "https://res.cloudinary.com/droju2iga/image/upload/v1745237659/default_event_artbhy.png";
    const defaultEventStatus = "ONGOING";
    const minCapacity = 1;

    const createAnEvent = async () => {
    
            try {
    
                const response = await axiosInstance.post("/create-event", {
                    title: event?.title,
                    description: event?.description,
                    category: event?.category,
                    date: event?.date,
                    time: event?.time,
                    location: address,
                    imageUrl: event?.imageUrl ?? defaultEventUrl,
                    tags: event?.tags ?? [],
                    latitude: coordinates?.latitude,
                    longitude: coordinates?.longitude,
                    isPrivate: event?.isPrivate,
                    isDraft: false,
                    maximumCapacity: event?.maximumCapacity,
                    eventStatus: event?.status ?? defaultEventStatus,
                    addressName: addressName,
                }
                , {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }
                });


                console.log("Event created successfully:", response.data);
                
    
            }
            catch (error) {
                console.error("Error creating event:", error);
            }
          
        }

    const handleCreateEvent = async (event: React.FormEvent) => {
        event.preventDefault();
        createAnEvent();
    
    };

    const updateEventPicture = async () => {

        try {
          const formData = new FormData();
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                formData.append("eventImage", file);
                try {
                    const response = await axiosInstance.post("/update/event-image", formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    console.log("Event image updated successfully:", response.data);
                } catch (error) {
                    console.error("Error updating event image:", error);
                }
            }
          };  
          fileInput.click();
        }
        catch (error) {
            console.error("Error creating file input:", error);
        }

    }

    return (
        <div className="create-event-form">
        <h2>Create Event</h2>
        <form onSubmit={handleCreateEvent}> 
            <div className="event-image-upload">
                <img src="default_event.png" alt="Event-Pic" />
                  <div className="camera-overlay" onClick={updateEventPicture}>
                    <FontAwesomeIcon icon={faCamera} size="2x" />
                  </div>
            </div>
            <div className='event-location-selector'>
                <EventLocationSelector setCoordinates={setCoordinates} setAddress={setAddress} setAddressName={setAddressName} />
                {coordinates && (
                    <div className="coordinates-display">
                        Latitude: {coordinates.latitude}, Longitude: {coordinates.longitude}
                        </div>
                )}
            </div>
            <label>
                    {address}
            </label>
            <div className="event-inputs">
                <input 
                    type="text" 
                    placeholder="Event Title"
                    value={event?.title || ""}
                    onChange={(e) => setEvent({...event, title: e.target.value} as Event)} 
                    required/>
                <input 
                    type="text" 
                    placeholder="Event Category"
                    value={event?.category || ""}
                    onChange={ (e) => setEvent( {...event, category: e.target.value} as Event)}
                    required />
                <input 
                    type="text" 
                    placeholder="Event Description" 
                    value={event?.description || ""}
                    onChange={(e) => setEvent( {...event, description: e.target.value } as Event)} 
                    required />
                <input 
                    type="date"
                    placeholder="Event Date"
                    value={event?.date || Date.now().toString()}
                    onChange={(e) => setEvent( {...event, date: e.target.value} as Event)}
                    required />
                <input 
                    type='time' 
                    placeholder="Event Time"
                    value={event?.time || Date.now().toString()}
                    onChange={(e) => setEvent( {...event, time: e.target.value} as Event)}
                    required />
                <input
                    type="number" 
                    placeholder="Maximum Capacity"
                    value={event?.maximumCapacity || minCapacity}
                    onChange={(e) => setEvent( {...event, maximumCapacity: parseInt(e.target.value, 10)} as Event)}
                    required />
                <div className='event-type'>
                    <label>
                        <input
                            type="checkbox"
                            name="eventType"
                            value="private"
                            checked={event?.isPrivate || false}
                            onChange={(e) => setEvent( {...event, isPrivate: e.target.checked} as Event)}
                            required /> Private Event
                    </label>
                </div>

                    <label>
                        <input 
                            type="checkbox" 
                            name="isDraft" 
                            value={String(event?.isDraft === true)} required /> Save as Draft
                        <label>Save as Draft</label>
                    </label>
            </div>
            <button
                    type="submit" 
                    onClick={handleCreateEvent}>Create Event</button>
        </form>
    </div>
    );
}


export default CreateEvent;