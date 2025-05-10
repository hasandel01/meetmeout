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
import { useNavigate } from 'react-router-dom';

const CreateEventForm = () => {
    
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<any>({});
    const navigate = useNavigate();

    const validateStep = (currentStep: number) => {
        const newErrors: any = {};
    
        if (currentStep === 1) {
          if(!event.title.trim()) newErrors.title = "Title is required.";
          if(!event.date.trim()) newErrors.date = "Date is required.";
          if(!event.time.trim()) newErrors.time = "Time is required.";
        } else if (currentStep === 2) {
          if (!coordinates) newErrors.location = "Please select a location on the map.";
        } else if (currentStep === 3) {
          if (!event.maximumCapacity || event.maximumCapacity < 1) newErrors.maximumCapacity = "Capacity must be at least 1.";
          if (!event.category) newErrors.category = "Please select a category.";
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        const isValid = validateStep(step);
        if (!isValid) return;
        setStep((prev) => prev + 1);
      };

    const handleBack = () => setStep((prev) => prev - 1);

    const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number} | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [addressName, setAddressName] = useState<string | null>(null);


    const [selectedImageFile, setSelectedImageFile] = useState<File | null>();
    
    const [event, setEvent] = useState<Event>({
        id: 1,
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: "https://res.cloudinary.com/droju2iga/image/upload/v1746880197/default_event_wg5tsm.png",
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
        latitude: 0,
        likes: [],
        comments: [],
        reviews: []
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
                    
                    if (selectedImageFile.size > 10 * 1024 * 1024) {
                        toast.error("Image must be under 10MB.");
                        return;
                    }         
                    
                    formData.append("eventImage", selectedImageFile);
                }
    
                    const response = await axiosInstance.post("/create-event", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                    });

                    toast.success("Event created successfully!");
                    setEvent((prev) => prev.id = response.data)
                    setTimeout(() => navigate(`/event/${event.id}`), 100);            
    
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

    const fetchDefaultImageAndConvertItToFile = async () => {

            try {

                const response = await fetch("https://res.cloudinary.com/droju2iga/image/upload/v1746880197/default_event_wg5tsm.png");
                const blob = await response.blob();
                const file = new File([blob],"default_event.png",{type: blob.type})
                setSelectedImageFile(file)
            }
            catch(error) {
                toast.error("Error fetching default image.")
            }
        }

            if (!selectedImageFile) {
                fetchDefaultImageAndConvertItToFile();
            }

   
    }, [])


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
        return `${hours}:${minutes}`;
    }


    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className={styles.eventInfoAndDate}>
                        <div className={styles.inputGroup}>
                            <h4>Event Information</h4>
                            <hr/>
                            <input 
                                type="text" 
                                placeholder="Event Title"
                                value={event.title}
                                onChange={(e) => setEvent({...event, title: e.target.value} )} 
                                required/>
                            {errors.title && <p className={styles.errorText}>{errors.title}</p>}
                            <input 
                                type="text" 
                                placeholder="Event Description" 
                                value={event.description}
                                className={styles.descriptionText}
                                onChange={(e) => setEvent( {...event, description: e.target.value } )} 
                                />
                            {errors.description && <p className={styles.errorText}>{errors.description}</p>}
                        </div>
                        <div className={styles.inputGroup}>
                            <h4>Event Time</h4>
                            <hr/>
                            <input 
                                type="date"
                                placeholder="Event Date"
                                value={event.date}
                                onChange={(e) => setEvent( {...event, date: e.target.value} )}
                                min={getTodayFormatted()}
                                required />
                            {errors.date && <p className={styles.errorText}>{errors.date}</p>}
                            <input 
                                type='time' 
                                placeholder="Event Time"
                                value={event.time}
                                onChange={(e) => setEvent( {...event, time: e.target.value} )}
                                min={isToday ? getTimeFormatted(): undefined}
                                required />
                            {errors.time && <p className={styles.errorText}>{errors.time}</p>}
                        </div>
                    </div>    
                )
            case 2:
                return (
                    <div className={styles.eventLocationSelectorContainer}>
                        {errors.location && <p className={styles.errorText}>{errors.location}</p>}  <div className={styles.eventLocationSelector}>
                            <EventLocationSelector setCoordinates={setCoordinates} setAddress={setAddress} setAddressName={setAddressName} />
                        </div>
                        
                    </div>
                )
            case 3:
                return (
                    <div className={styles.eventDetails}>
                        <div className={styles.capacityContainer}>
                            <h4>Maximum capacity</h4>
                            <hr/>
                                <input
                                        type="number" 
                                        min={1}
                                        placeholder="Maximum Capacity"
                                        value={event.maximumCapacity}
                                        onChange={(e) => setEvent( {...event, maximumCapacity: parseInt(e.target.value, 10)})}
                                        required />
                                {errors.maximumCapacity && <p className={styles.errorText}>{errors.maximumCapacity}</p>}
                        </div>
                        <div className={styles.categoryTags}>
                                <h4>Select Category and Enter tags to let everyone know!</h4>
                                <hr/>
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
                                        {errors.category && <p className={styles.errorText}>{errors.category}</p>}
                                        <div className={styles.tags}>
                                            <TagInput tags={event.tags} setTags={(newTags) => setEvent({...event, tags: newTags})} />
                                        </div>
                                </div>
                                <div className={styles.eventType}>
                                <h4>Preferences</h4>
                                <hr/>
                                    <div className={styles.eventCheckBoxes}> 
                                        <label>
                                                <input
                                                    type="checkbox"
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
                                </div>
                    </div>
                )
            case 4:
                return (
                    <div className={styles.eventImageUploadContainer}>
                        <h4>Upload an image to represent your event!</h4>
                        <div className={styles.eventImageUpload}>
                            <img src={event.imageUrl} alt="Event-Pic" />
                            <div className={styles.cameraOverlay} onClick={updateEventPicture}>
                                <FontAwesomeIcon icon={faCamera} size="2x" />
                            </div>
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className={styles.eventSummary}>
                    <h4>Review Your Event</h4>
                    <hr />
        
                    <div className={styles.eventPreview}>
                        <img src={event.imageUrl} alt="Event" className={styles.previewImage} />
        
                        <div className={styles.previewDetails}>
                            <p><strong>Title:</strong> {event.title}</p>
                            <p><strong>Description:</strong> {event.description}</p>
                            <p><strong>Date:</strong> {event.date}</p>
                            <p><strong>Time:</strong> {event.time}</p>
                            <p><strong>Location:</strong> {addressName}</p>
                            <p><strong>Latitude:</strong> {coordinates?.latitude}</p>
                            <p><strong>Longitude:</strong> {coordinates?.longitude}</p>
                            <p><strong>Capacity:</strong> {event.maximumCapacity}</p>
                            <p><strong>Category:</strong> {getCategoryIconLabel(event.category).label}</p>
                            <p><strong>Tags:</strong> {Array.isArray(event.tags) ? event.tags.join(', ') : "None"}</p>
                            <p><strong>Private:</strong> {event.isPrivate ? "Yes" : "No"}</p>
                            <p><strong>Draft:</strong> {event.isDraft ? "Yes" : "No"}</p>
                        </div>
                    </div>
        
                    <p className={styles.warningText}>
                        Please double-check all the details before submitting your event.
                    </p>
                </div>
                )
            default: return null
        }
    }

    return (
        <div className={styles.createEventFormContainer}>
            <div className={styles.containerAlt}>
                <h4>Create an Event</h4>
                {renderStep()}
                <div  className={styles.buttons}>
                    {step > 1 && <button onClick={() =>handleBack()}> Back</button>}
                    {step < 5 && <button onClick={() => handleNext()}> Next</button>}
                    {step === 5 && <button onClick={handleCreateEvent}> Submit</button>}
                </div>
            </div>   
        </div>
    );
}


export default CreateEventForm;