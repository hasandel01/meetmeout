import React, { useEffect, useState } from 'react';
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from '../../../axios/axios';
import { Event } from '../../../types/Event';
import EventLocationSelector from '../../../map/EventLocationSelector/EventLocationSelector';
import styles from "./CreateEvent.module.css";
import { toast } from 'react-toastify';
import {categoryMap, getCategoryIconLabel} from "../../../mapper/CategoryMap"
import TagInput from './TagInput';

const CreateEvent = () => {
    
    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number} | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [addressName, setAddressName] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    
    const [event, setEvent] = useState<Event>({
        id: 1,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: "https://res.cloudinary.com/droju2iga/image/upload/v1745237659/default_event_artbhy.png",
        tags: [],
        isPrivate: false,
        isDraft: false,
        maximumCapacity: 1,
        status: 'ONGOING',
        attendees: [],
        organizer: null,
        addressName: '',
        category: '',
        longitude: 0,
        latitude: 0
    });


    const createAnEvent = async () => {
    
            try {

                if(coordinates?.latitude === 0 || coordinates?.longitude === 0) {
                    toast.error("Please select a location on the map so that others can join your event! 📍")
                    return;
                }


                const formData = new FormData();
                formData.append("title", event.title);
                formData.append("description", event.description);
                formData.append("category", event.category);
                formData.append("date", event.date);
                formData.append("time", event.time);
                formData.append("location", address || '');
                event.tags.forEach((tag) => {
                    formData.append("tags",tag);
                });
                formData.append("latitude", coordinates?.latitude.toString() || '');
                formData.append("longitude", coordinates?.longitude.toString() || '');
                formData.append("isPrivate", event.isPrivate.toString());
                formData.append("isDraft", event.isDraft.toString());
                formData.append("maximumCapacity", event.maximumCapacity.toString());
                formData.append("status", event.status);
                formData.append("addressName", addressName || '');


                if (selectedImageFile) {
                    formData.append("eventImage", selectedImageFile);
                }
    
                await axiosInstance.post("/create-event", formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }
                });

                    toast.success("Event created successfully!");                
    
            }
            catch (error) {
                toast.error("There was an error when creating the event");
            }
          
        }

    const handleCreateEvent = (event: React.FormEvent) => {
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
                const imageUrl = URL.createObjectURL(file);
                setEvent((prev) => ({
                    ...prev,
                    imageUrl: imageUrl}));
                formData.append("eventImage", file);
                setSelectedImageFile(file);
            }
          };  
          fileInput.click();

        }
        catch (error) {
            console.error("Error creating file input:", error);
        }
     
    }
    
    useEffect(() => {

    }, [event.imageUrl])


    const todayDate = new Date();
    const selectedDate = new Date(event.date);

    const isToday = 
    todayDate.getFullYear() === selectedDate.getFullYear() &&
    todayDate.getMonth() === selectedDate.getMonth() &&
    todayDate.getDate() === selectedDate.getDate();

    

    const getTodayFormatted = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTimeFormatted = () => {
        const today = new Date();
        const hours = String(today.getHours()).padStart(2,'0');
        const minutes = String(today.getMinutes()).padStart(2,'0');
        
        console.log(isToday)
        console.log(`${hours}:${minutes}`)
        return `${hours}:${minutes}`;
    }

    return (
        <div className={styles.createEventFormContainer}>
        <form onSubmit={handleCreateEvent}> 
            <div className={styles.imageAndMapContainer}> 
                <div className={styles.eventImageUploadContainer}>
                    <div className={styles.eventImageUpload}>
                        <img src={event.imageUrl} alt="Event-Pic" />
                        <div className={styles.cameraOverlay} onClick={updateEventPicture}>
                            <FontAwesomeIcon icon={faCamera} size="2x" />
                        </div>
                    </div>
                </div>
                    <p>Pick somewhere to choose your event location!</p>
                    <div className={styles.eventLocationSelector}>
                        <EventLocationSelector setCoordinates={setCoordinates} setAddress={setAddress} setAddressName={setAddressName} />
                        {coordinates && (
                            <div className={styles.coordinatesDisplay}>
                                Latitude: {coordinates.latitude}, Longitude: {coordinates.longitude}
                                </div>
                        )}
                    </div>
            </div>
            <div className={styles.eventSelections}>
                <div className={styles.eventInputs}>
                    <input 
                        type="text" 
                        placeholder="Event Title"
                        value={event.title}
                        onChange={(e) => setEvent({...event, title: e.target.value} )} 
                        required/>
                    <input 
                        type="text" 
                        placeholder="Event Description" 
                        value={event.description}
                        onChange={(e) => setEvent( {...event, description: e.target.value } )} 
                        />
                    <select
                        value={event.category}
                        onChange={(e) => setEvent({...event, category: e.target.value})}
                        required
                    >
                        <option value="">Select Category</option>
                        {Object.keys(categoryMap).map((key) => {
                            const {icon, label} = getCategoryIconLabel(key);
                            return (
                                <option key={key} value={key}>
                                    {icon} {label}
                                </option>
                            );
                        })}
                    </select>
                    <input 
                        type="date"
                        placeholder="Event Date"
                        value={event.date}
                        onChange={(e) => setEvent( {...event, date: e.target.value} )}
                        min={getTodayFormatted()}
                        required />
                    <input 
                        type='time' 
                        placeholder="Event Time"
                        value={event.time}
                        onChange={(e) => setEvent( {...event, time: e.target.value} )}
                        min={isToday ? getTimeFormatted(): undefined}
                        required />
                    <input
                        type="number" 
                        placeholder="Maximum Capacity"
                        value={event.maximumCapacity}
                        onChange={(e) => setEvent( {...event, maximumCapacity: parseInt(e.target.value, 10)})}
                        required />
                    <div className={styles.eventType}>
                        <label>
                            <input
                                type="checkbox"
                                name="eventType"
                                value="private"
                                checked={event.isPrivate}
                                onChange={(e) => setEvent( {...event, isPrivate: e.target.checked})}
                                /> Private Event
                        </label>
                        <label>
                            <input 
                                type="checkbox" 
                                name="isDraft"
                                checked={event.isDraft} 
                                onChange={(e) => setEvent({...event, isDraft: e.target.checked})}/>
                                Save as a Draft
                        </label>
                    </div>
                        <div>
                        <TagInput tags={event.tags} setTags={(newTags) => setEvent({...event, tags: newTags})} />
                    </div>
                        <button type="submit" >Create Event</button>
                </div>
            </div>
            
        </form>
    </div>
    );
}


export default CreateEvent;