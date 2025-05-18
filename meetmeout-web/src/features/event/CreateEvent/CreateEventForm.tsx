import React, { useEffect, useState } from 'react';
import { faCamera, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from '../../../axios/axios';
import { Event } from '../../../types/Event';
import EventLocationSelector from '../../../map/EventLocationSelector/EventLocationSelector';
import styles from "./CreateEvent.module.css";
import { toast } from 'react-toastify';
import {categoryMap, getCategoryIconLabel} from "../../../mapper/CategoryMap"
import TagInput from './TagInput';
import { useNavigate } from 'react-router-dom';
import { faCalendarAlt, faClock, faMapMarkerAlt, faUsers, faLock, faTag, faFolder } from "@fortawesome/free-solid-svg-icons";
import confetti from "canvas-confetti";
import { RouteType } from '../../../types/RouteType';

const CreateEventForm = () => {
    
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<any>({});
    const navigate = useNavigate();
    const [routeType, setRouteType] = useState<RouteType>();

        const newErrors: any = {};

    const validateStep = (currentStep: number) => {
    
        if (currentStep === 1) {
          if(!event.title.trim()) newErrors.title = "Title is required.";
          if(!event.date.trim()) {
            newErrors.date = "Date is required.";
          } else {
             const now = Date.now();
             const inputDate = new Date(`${event.date}T${event.startTime}`); 
                if(now > inputDate.getTime())
                    newErrors.date = "Date shouldn't be past time."
            }


          if(!event.startTime.trim()) newErrors.startTime = "Start time is required.";
          if(!event.endTime.trim()) newErrors.endTime = "End time is required.";
        
            const start = new Date(`1970-01-01T${event.startTime}`);
            const end = new Date(`1970-01-01T${event.endTime}`);

            if(end <= start) 
                newErrors.endTime = "End time should be later than the start time."


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
    const [endCoordinates, setEndCoordinates] = useState<{ latitude: number, longitude: number} | null>(null);


    const [selectedImageFile, setSelectedImageFile] = useState<File | null>();
    
    const [event, setEvent] = useState<Event>({
        id: 1,
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
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
        reviews: [],
        createdAt: '',
        isThereRoute: false,
        isCapacityRequired: false,
        isFeeRequired: false,
        fee: 0,
        endLatitude: 0,
        endLongitude: 0
    });

    const showConfetti = () => {
        confetti({
            particleCount: 200,
            spread: 80,
            origin: {y:0.6},
        })
    }

    const createAnEvent = async (isDraft: boolean) => {
    
            try {

                if(coordinates?.latitude === 0 || coordinates?.longitude === 0) {
                    toast.error("Please select a location on the map so that others can join your event! 📍")
                    return;
                }

                setEvent(prev => ({...prev, isDraft: isDraft}))

                console.log(isDraft) 

                const formData = new FormData();
                formData.append("title", event.title);
                formData.append("description", event.description);
                formData.append("category", event.category);
                formData.append("date", event.date);
                formData.append("startTime", event.startTime);
                formData.append("endTime", event.endTime);
                formData.append("location", address || '');
                event.tags.forEach((tag) => {
                    formData.append("tags",tag);
                });

                formData.append("latitude", coordinates?.latitude.toString() || '');
                formData.append("longitude", coordinates?.longitude.toString() || '');
                formData.append("isThereRoute", event.isThereRoute.toString() || '');
                formData.append("endLatitude", event.endLatitude.toString() || '');
                formData.append("endLongitude", event.endLongitude.toString() || '');
                formData.append("isPrivate", event.isPrivate.toString());
                formData.append("isDraft", isDraft.toString());
                formData.append("isCapacityRequired", event.isCapacityRequired.toString() || '');
                formData.append("maximumCapacity", event.maximumCapacity.toString());
                formData.append("isFeeRequired", event.isFeeRequired.toString() || '');
                formData.append("fee", event.fee.toString() || '');
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

                    if(!isDraft) {
                        toast.success("Event created successfully!");
                        showConfetti();
                    } else {
                        toast.info("Your draft is saved successfully!");
                    }

                    setEvent((prev) => prev.id = response.data)
                    setTimeout(() => navigate(`/event/${event.id}`), 100);            
    
            }
            catch (error) {
                toast.error("There was an error when creating the event");
            }
          
        }

    const handleCreateEvent = (event: React.FormEvent, isDraft: boolean) => {
        event.preventDefault(); 
        createAnEvent(isDraft);
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
        const today = new Date(Date.now());
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
                            <textarea 
                                maxLength={50}
                                placeholder="Event Title"
                                value={event.title}
                                className={styles.inputTitle}
                                onChange={(e) => setEvent({...event, title: e.target.value} )} 
                                required/>
                            {errors.title && <p className={styles.errorText}>{errors.title}</p>}
                            <textarea
                                maxLength={500}
                                placeholder="Event Description (500 characters max)" 
                                value={event.description}
                                className={styles.inputDescription}
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
                        <div className={styles.timeInputs}>
                               <div className={styles.timeInput}>
                                    <label>Start Time </label>
                                    <input 
                                        type='time' 
                                        placeholder="Event Start Time"
                                        value={event.startTime}
                                        onChange={(e) => setEvent( {...event, startTime: e.target.value} )}
                                        min={isToday ? getTimeFormatted(): undefined}
                                        required />
                                </div> 
                                <div className={styles.timeInput}>
                                    <label>End Time </label>
                                    <input 
                                    type='time' 
                                    placeholder="Event End Time"
                                    value={event.endTime}
                                    onChange={(e) => setEvent( {...event, endTime: e.target.value} )}
                                    min={event.startTime ? event.startTime : getTimeFormatted()}
                                    required />
                                </div>   
                                {errors.startTime && <p className={styles.errorText}>{errors.startTime}</p>}
                                {errors.endTime && <p className={styles.errorText}>{errors.endTime}</p>}
            
                            </div>
                        </div>
                    </div>    
                )
            case 2:
                return (
                    <div className={styles.eventLocationSelectorContainer}>
                        <label>
                        <input
                            type='checkbox'
                            value="thereIsRoute"
                            checked={event.isThereRoute}
                            onChange={(e) => setEvent({...event, isThereRoute: e.target.checked})}   
                        />Will there be a route?
                        {event.isThereRoute && 
                            <div className={styles.radioButtonsContainer}>
                                <label>
                                    <input
                                        type='radio'
                                        value={"driving-car"}
                                        checked = {routeType === RouteType.CAR}
                                        onChange={() => {setRouteType(RouteType.CAR)}}
                                    >
                                    </input>
                                    Car
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        value={"foot-walking"}
                                        checked = {routeType === RouteType.WALKING}
                                        onChange={() => setRouteType(RouteType.WALKING)}
                                    >
                                    </input>
                                    Walking
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        value={"cycling-regular"}
                                        checked = {routeType === RouteType.CYCLING}
                                        onChange={() => setRouteType(RouteType.CYCLING)}
                                    >
                                    </input>
                                    Cycling
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        value={"foot-hiking"}
                                        checked = {routeType === RouteType.HIKING}
                                        onChange={() => setRouteType(RouteType.HIKING)}
                                    >
                                    </input>
                                    Hiking
                                </label>
                            </div>
                        }
                        </label>    
                        {errors.location && <p className={styles.errorText}>{errors.location}</p>}  
                        <div className={styles.eventLocationSelector}>
                            <EventLocationSelector setCoordinates={setCoordinates} setAddress={setAddress} route={routeType ?? RouteType.CAR} 
                            setAddressName={setAddressName} isThereRoute={event.isThereRoute} setEndCoordinates={setEndCoordinates}/>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <>
                    <div className={styles.eventDetails}>
                        <div className={styles.capacityContainer}>
                            <label>
                                <input
                                type='checkbox'
                                value="capacity-requirement"
                                checked={event.isCapacityRequired}
                                onChange={(e) => setEvent({...event, isCapacityRequired: e.target.checked})}
                                >
                                </input>
                                Will there be a capacity constraint?
                            </label>
                            {event.isCapacityRequired && 
                            <>
                            <h4>Maximum capacity</h4>
                                <hr />
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Maximum Capacity"
                                    value={event.maximumCapacity}
                                    onChange={(e) => setEvent({ ...event, maximumCapacity: parseInt(e.target.value, 10) })}
                                    required />
                                {errors.maximumCapacity && <p className={styles.errorText}>{errors.maximumCapacity}</p>}
                            </>
                            }
                        </div>
                        <div className={styles.feeContainer}>
                            <label>
                                <input
                                type='checkbox'
                                value="fee-requirement"
                                checked={event.isFeeRequired}
                                onChange={(e) => setEvent({...event, isFeeRequired: e.target.checked})}
                                >
                                </input>
                                Will there be fee?
                            </label>
                            {event.isFeeRequired && 
                            <>
                            <h4>Fee</h4>
                                <hr />
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Fee"
                                    value={event.fee}
                                    onChange={(e) => setEvent({ ...event, fee: parseInt(e.target.value, 10) })}
                                    required />
                                {errors.maximumCapacity && <p className={styles.errorText}>{errors.maximumCapacity}</p>}
                            </>
                            }
                               
                        </div>
                        <div className={styles.categoryTags}>
                            <h4>Select Category and Enter tags to let everyone know!</h4>
                            <hr />
                            <select
                                value={event.category}
                                onChange={(e) => setEvent({ ...event, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {Object.keys(categoryMap).map((key) => {
                                    const { icon, label } = getCategoryIconLabel(key);
                                    return (
                                        <option key={key} value={key}>
                                            {icon} {label}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.category && <p className={styles.errorText}>{errors.category}</p>}
                        </div>
                        <div className={styles.tags}>
                            <TagInput tags={event.tags} setTags={(newTags) => setEvent({ ...event, tags: newTags })} />
                        </div>
                    </div><div className={styles.eventType}>
                            <h4>Preferences</h4>
                            <hr />
                            <div className={styles.eventCheckBoxes}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="private"
                                        checked={event.isPrivate}
                                        onChange={(e) => setEvent({ ...event, isPrivate: e.target.checked })} /> Private Event
                                </label>
                            </div>
                        </div></>
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
                        {event.isPrivate ?
                            (
                                <>
                                <FontAwesomeIcon icon={faLock} size='2x' /> 
                                </>
                            ) : (
                                <>
                                <FontAwesomeIcon icon={faUnlock} size='2x'/>
                                </>
                    )}       
                    <div className={styles.eventPreview}>
                        <div className={styles.eventPreviewHeader}>
                            <img src={event.imageUrl} alt="Event" className={styles.previewImage} />
                            <div className={styles.eventPriewInfo}>
                                <h3>{event.title}</h3>
                                <p>{event.description}</p>
                            </div>
                        </div>

                        <div className={styles.previewDetails}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> {event.date}
                            <FontAwesomeIcon icon={faClock}  /> {event.startTime} - {event.endTime}
                            <FontAwesomeIcon icon={faMapMarkerAlt}  /> {addressName}
                            <FontAwesomeIcon icon={faFolder}  />  {getCategoryIconLabel(event.category).label}
                            <FontAwesomeIcon icon={faTag}  />  {Array.isArray(event.tags) ? event.tags.join(', ') : "None"}
                            <>
                            <FontAwesomeIcon icon={faUsers} /> {event.maximumCapacity}
                            </>
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
                <div className={styles.stepContainer}>
                    <div className={styles.step}>
                        <div className={step >= 1 ? `${styles.stepCircleActive}`  : `${styles.stepCircle}`}> </div>
                        <span>Information</span>
                    </div>
                    <div className={styles.step}>
                        <div className={step >= 2 ? `${styles.stepCircleActive}`  : `${styles.stepCircle}`}>  </div>
                        <span>Location</span>
                    </div>
                    <div className={styles.step}>
                        <div className={step >= 3 ? `${styles.stepCircleActive}`  : `${styles.stepCircle}`}> </div>
                        <span>Rules</span>
                    </div>
                    <div className={styles.step}>
                        <div className={step >= 4 ? `${styles.stepCircleActive}`  : `${styles.stepCircle}`}> </div>
                        <span>Image</span>
                    </div>
                    <div className={styles.step}>
                        <div className={step >= 5 ? `${styles.stepCircleActive}`  : `${styles.stepCircle}`}> </div>
                        <span>Summary</span>
                    </div>
                </div>

                {renderStep()}
                <div  className={styles.buttons}>
                    {step > 1 && <button onClick={() =>handleBack()}> Back</button>}
                    {step < 5 && <button onClick={() => handleNext()}> Next</button>}
                    {step === 5 && 
                    <>
                    <button className={styles.draftButton} onClick={(e) => handleCreateEvent(e, true)}>Save as Draft</button>
                    <button onClick={(e) => handleCreateEvent(e, false)}>Submit</button>
                    </>
                    }
                </div>
            </div>   
        </div>
    );
}


export default CreateEventForm;