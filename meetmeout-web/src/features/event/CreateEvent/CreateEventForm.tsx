import React, { useEffect, useState } from 'react';
import { faArrowLeft, faCamera, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axiosInstance from '../../../axios/axios';
import { Event } from '../../../types/Event';
import EventLocationSelector from '../../../map/EventLocationSelector/EventLocationSelector';
import styles from "./CreateEvent.module.css";
import { toast } from 'react-toastify';
import {categoryMap, getCategoryIconLabel} from "../../../mapper/CategoryMap"
import TagInput from './TagInput';
import { useLocation, useNavigate } from 'react-router-dom';
import { faCalendarAlt, faMapMarkerAlt, faUsers, faLock, faTag, faFolder, faMoneyBill, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import confetti from "canvas-confetti";
import { RouteType } from '../../../types/RouteType';
import { useBadgeContext } from '../../../context/BadgeContext';


const isStartDateAndEndDateSame = (event: Event): boolean => {
    return new Date(event.startDate).toLocaleDateString() === new Date(event.endDate).toLocaleDateString();
};

const CreateEventForm = () => {
    
    const [step, setStep] = useState(1);
    const steps = ["Information","Location","Rules","Image","Summary"];
    const [errors, setErrors] = useState<any>({});
    const navigate = useNavigate();
    const [routeType, setRouteType] = useState<RouteType>(RouteType.CAR);
    const location = useLocation();
    const draftEvent = location.state?.draftEvent;
    const [isDraftEvent, setIsDraftEvent] = useState(false);

    useEffect(() => {
        if (draftEvent) {
            setEvent(draftEvent);
            setIsDraftEvent(true);
            if (draftEvent.latitude && draftEvent.longitude) {
            setCoordinates({ latitude: draftEvent.latitude, longitude: draftEvent.longitude });
            }
            setAddressName(draftEvent.addressName || "");
            setEndAddressName(draftEvent.endAddressName || "");
            setRouteType(draftEvent.routeType || RouteType.CAR);
        }
        }, [draftEvent]);


    const newErrors: any = {};

    const validateStep = (currentStep: number) => {
    
        if (currentStep === 1) {
          if(!event.title.trim()) newErrors.title = "Title is required.";
          if(!event.startDate.trim()) newErrors.date = "Start date is required.";
          if(!event.startTime.trim()) newErrors.date = "End date is required."
          if (!event.endDate.trim()) newErrors.date = "End date is required.";
          if (!event.endTime.trim()) newErrors.endTime = "End time is required.";

            if (
                event.startDate.trim() &&
                event.endDate.trim() &&
                event.startTime.trim() &&
                event.endTime.trim()
            ) {
                const now = Date.now();
                const start = new Date(`${event.startDate}T${event.startTime}`); 
                    
                if(now > start.getTime())
                        newErrors.date = "Date shouldn't be past time."

                const end = new Date(`${event.endDate}T${event.endTime}`)

                if(end <= start)
                    newErrors.endTime = "End time should be later than start time." 
                }



          if(!event.startTime.trim()) newErrors.startTime = "Start time is required.";
          if(!event.endTime.trim()) newErrors.endTime = "End time is required.";
        
        } else if (currentStep === 2) {
          if (!coordinates) newErrors.location = "Please select a location on the map.";
        } else if (currentStep === 3) {
          if (!event.maximumCapacity || event.maximumCapacity < 1) newErrors.maximumCapacity = "Capacity must be at least 1.";
          if (!event.category) newErrors.category = "Please select a category.";
          if(event.fee > 1000000) newErrors.fee = "Maximum fee is 1000000"
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
    const [addressName, setAddressName] = useState<string | null>(null);
    const [endAddressName, setEndAddressName] = useState<string | null>(null);
    const [routeJson, setRouteJson] = useState('');

    const {getMe} = useBadgeContext();

    const [selectedImageFile, setSelectedImageFile] = useState<File | null>();
    
    const [event, setEvent] = useState<Event>({
        id: 999,
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
        eventPhotos: [],
        routeJson: '',
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

                if(!event.isCapacityRequired)
                    event.maximumCapacity = 2147483647;

                const formData = new FormData();
                formData.append("title", event.title);
                formData.append("description", event.description);
                formData.append("category", event.category);
                formData.append("startDate", event.startDate);
                formData.append("endDate", event.endDate)
                formData.append("startTime", event.startTime);
                formData.append("endTime", event.endTime);
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
                formData.append("feeDescription", event.feeDescription.toString() || '');
                formData.append("isCapacityRequired", event.isCapacityRequired.toString() || '');
                formData.append("maximumCapacity", event.maximumCapacity.toString());
                formData.append("isFeeRequired", event.isFeeRequired.toString() || '');
                formData.append("fee", event.fee.toString() || '');
                formData.append("status", event.status);
                formData.append("addressName", addressName || '');
                formData.append("endAddressName", endAddressName || '');
                formData.append("routeType", routeType);
                formData.append("routeJson", JSON.stringify(routeJson));

                if (selectedImageFile) {
                    
                    if (selectedImageFile.size > 10 * 1024 * 1024) {
                        toast.error("Image must be under 10MB.");
                        return;
                    }         
                    
                    formData.append("eventImage", selectedImageFile);
                }
    
                    if(isDraftEvent) {

                    console.log("draft event")

                    const response = await axiosInstance.put(`/events/${event.id}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })

                    const newEvent = response.data;

                    if(!isDraft) {
                        toast.success("Event created successfully!");
                        showConfetti();
                    } else {
                        toast.info("Your draft is saved successfully!");
                    }

                    setEvent((prev) => prev.id = response.data)
                    await getMe();
                    await navigate(`/event/${newEvent.id}`);

                } else {
                    const response = await axiosInstance.post("/events", formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    const newEvent = response.data;

                    if (!isDraft) {
                        toast.success("Event created successfully!");
                        showConfetti();
                    } else {
                        toast.info("Your draft is saved successfully!");
                    }

                    setEvent(prev => ({ ...prev, ...newEvent }));
                    await getMe();
                    navigate(`/event/${newEvent.id}`);

                }
    
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
    const selectedDate = new Date(event.startDate);

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

    const getMaxDateFormatted = () => {
        const today = new Date();
        today.setFullYear(today.getFullYear() + 5);
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className={styles.eventInfoAndDate}>
                        <div className={styles.stepIntro}>
                            <h2>Let's Create Your Event!</h2>
                            <p>Fill out the details below to bring people together. 
                                Start by giving your event a title, a short description, and let us know when it's happening.</p>
                        </div>
                        <div className={styles.inputGroup}>
                            <h3>Event Information</h3>
                            <hr/>
                            <div className={styles.titleAndDescription}>
                                <h4>Event Title</h4>
                                <hr/>
                                <textarea 
                                    maxLength={50}
                                    placeholder="Start with a intriguing title."
                                    value={event.title}
                                    className={styles.inputTitle}
                                    onChange={(e) => setEvent({...event, title: e.target.value} )} 
                                    required/>
                                {errors.title && <p className={styles.errorText}>{errors.title}</p>}
                                <h4>Event Description</h4>
                                <hr/>
                                <textarea
                                    maxLength={500}
                                    placeholder="Inform people about the event..." 
                                    value={event.description}
                                    className={styles.inputDescription}
                                    onChange={(e) => setEvent( {...event, description: e.target.value } )} 
                                    />
                                <p className={styles.charCounter}>{event.description.length}/500</p>
                                {errors.description && <p className={styles.errorText}>{errors.description}</p>}
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <h4>Event Time</h4>
                            <hr/> 
                            <div className={styles.timeInput}>
                                <h4>Start</h4>
                                <input 
                                    type="date"
                                    placeholder="Event Start Date"
                                    value={event.startDate}
                                    onChange={(e) => setEvent( {...event, startDate: e.target.value} )}
                                    min={getTodayFormatted()}
                                    max={getMaxDateFormatted()}
                                    required />
                                <input 
                                    type='time' 
                                    placeholder="HH:MM (24h)"
                                    value={event.startTime}
                                    onChange={(e) => setEvent( {...event, startTime: e.target.value} )}
                                    min={isToday ? getTimeFormatted(): undefined}
                                    max={getMaxDateFormatted()}
                                    required />
                            </div>
                            <div className={styles.timeInput}>
                            <h4>End</h4>
                                <input 
                                    type="date"
                                    placeholder="Event Start Date"
                                    value={event.endDate}
                                    onChange={(e) => setEvent( {...event, endDate: e.target.value} )}
                                    min={getTodayFormatted()}
                                    required />
                                    <input 
                                    type='time' 
                                    placeholder="HH:MM (24h)"
                                    value={event.endTime}
                                    onChange={(e) => setEvent( {...event, endTime: e.target.value} )}
                                    min={event.startTime ? event.startTime : getTimeFormatted()}
                                    required />
                            </div>
                        </div> 
                        {errors.date && <p className={styles.errorText}>{errors.date}</p>}
                        {errors.startTime && <p className={styles.errorText}>{errors.startTime}</p>}
                        {errors.endTime && <p className={styles.errorText}>{errors.endTime}</p>}
                    </div>    
               )
            case 2:
                return (
                    <div className={styles.eventLocationSelectorContainer}>
                        <strong>Please specify whether your event takes place at a single location or follows a route from one point to another.</strong>
                        <div className={styles.routeSelection}>
                            <label>
                                <input
                                    type='checkbox'
                                    value="thereIsRoute"
                                    checked={event.isThereRoute}
                                    onChange={(e) => setEvent({...event, isThereRoute: e.target.checked})}   
                                />Event has a route?
                                {event.isThereRoute && <p>Then choose two points on the map</p>}
                            </label>  
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
  
                        </div>
                        <div className={styles.eventLocationSelector}>
                            <EventLocationSelector 
                            latitude={coordinates?.latitude} longitude={coordinates?.longitude} endLatitude={event.endLatitude} endLongitude={event.endLongitude}
                            setCoordinates={setCoordinates} route={routeType ?? RouteType.CAR} 
                            setRouteJson={setRouteJson}
                            setAddressName={setAddressName} setEndAddressName={setEndAddressName} isThereRoute={event.isThereRoute} setEndCoordinates={coords => {
                                setEvent({
                                    ...event,
                                    endLatitude: coords.latitude,
                                    endLongitude: coords.longitude
                                });
                            }}/>
                        </div>
                        {errors.location && <p className={styles.errorText}>{errors.location}</p>}  
                    </div>
                )
            case 3:
                return (
                    <>
                    <div className={styles.eventDetails}>
                        <div className={styles.eventCategoryAndTagsContainer}>
                            <h4>Select Category anda enter tags to let everyone recognize your event!</h4>
                            <hr />
                            <div className={styles.eventCategoryAndTags}>
                                <div className={styles.categoryTags}>
                                <h4>Category</h4>
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
                        </div>
                            </div>
                        <h4>Event Rules</h4>
                        <hr />
                        <div className={styles.eventRules}>
                            <div className={styles.capacityContainer}>
                                <label>
                                    <input
                                    type='checkbox'
                                    value="capacity-requirement"
                                    checked={event.isCapacityRequired}
                                    onChange={(e) => setEvent({...event, isCapacityRequired: e.target.checked})}
                                    >
                                    </input>
                                    Capacity constraint?
                                </label>
                                    <div className={`${event.isCapacityRequired ? `${styles.capacityInput}` :  styles.disabledGroup}`}>
                                    <h4>Maximum capacity</h4>
                                    <hr />
                                    <input
                                        type="number"
                                        min={1}
                                        placeholder="Maximum Capacity"
                                        value={event.maximumCapacity}
                                        onChange={(e) => setEvent({ ...event, maximumCapacity: parseInt(e.target.value, 10) })}
                                        disabled={!event.isCapacityRequired}
                                    />
                                    {errors.maximumCapacity && <p className={styles.errorText}>{errors.maximumCapacity}</p>}
                                </div>
                            </div>
                            <div className={styles.feeContainer}>
                                <label title='Fee applies to participants and can include food, venue or materials."'>
                                    <input
                                    type='checkbox'
                                    value="fee-requirement"
                                    checked={event.isFeeRequired}
                                    onChange={(e) => setEvent({...event, isFeeRequired: e.target.checked})}
                                    >
                                    </input>
                                    Fee required?
                                </label>
                                <div className={`${event.isFeeRequired ? styles.feeInput : styles.disabledGroup}`}>
                                    <h4>Fee</h4>
                                    <hr />
                                    <div className={styles.tlInputWrapper}>
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            max={1000000}
                                            placeholder="Fee"
                                            value={event.fee}
                                            onChange={(e) => setEvent({ ...event, fee: parseFloat(e.target.value) })}
                                            disabled={!event.isFeeRequired}
                                        />
                                    </div>
                                    <textarea
                                        rows={3}
                                        maxLength={300}
                                        placeholder='Inform the people on expenses...'
                                        value={event.feeDescription}
                                        onChange={(e) => setEvent({...event, feeDescription: e.target.value})}
                                        disabled={!event.isFeeRequired}
                                    />
                                    <p className={styles.feeDescriptionCounter}>{event.feeDescription.length}/300</p>
                                    </div>
                            </div>
                        </div>
                        {errors.fee && <p className={styles.errorText}>{errors.fee}</p>}
                    </div>
                        <div className={styles.eventPrivacy}>
                            <h4>Privacy</h4>
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
                            {event.isPrivate &&
                                <p className={styles.warningText}>
                                    This event is private. Only invited and accepted users can see it.
                                </p>
                            }
                        </div>
                </>
                )
            case 4:
                return (
                    <div className={styles.eventImageUploadContainer}>
                        <h4>Upload an image to represent your event!</h4>
                        <p> If you don't upload the default image will be used to represent the event!</p>
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
                    <p className={styles.warningText}>
                        Please double-check all the details before submitting your event.
                    </p>
                    <hr/>
                    <div className={styles.eventPreviewContainer}>
                        <div>
                            <FontAwesomeIcon
                            icon={event.isPrivate ? faLock : faUnlock}
                            size="2x"
                            title={event.isPrivate ? "Private Event" : "Public Event"}
                            />
                        </div>
                        <div className={styles.eventPreview}>
                            <div className={styles.eventPreviewHeader}>
                                <img src={event.imageUrl} alt="Event" className={styles.previewImage} />
                                <div className={styles.eventPreviewInfo}>
                                    <h3>{event.title}</h3>
                                    <div className={styles.eventDescription}>{event.description}</div>
                                </div>
                                </div>
                            </div>
                            <div className={styles.previewDetails}>
                            <p>
                                <FontAwesomeIcon icon={faCalendarAlt} /> {event.startDate} at {event.startTime}
                                {!isStartDateAndEndDateSame(event) && ` – ${event.endDate} at ${event.endTime}`}
                                {isStartDateAndEndDateSame(event) && ` – ${event.endTime}`}
                            </p>
                            <p>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> {addressName} 
                                {endAddressName && <> - {endAddressName} </>}
                            </p>
                            <p>
                                <FontAwesomeIcon icon={faFolder} /> {getCategoryIconLabel(event.category).label}
                            </p>
                            <p>
                                <FontAwesomeIcon icon={faTag} /> {Array.isArray(event.tags) ? event.tags.join(', ') : "None"}
                            </p>
                            {event.isCapacityRequired && (
                                <p>
                                <FontAwesomeIcon icon={faUsers} /> Max Capacity: {event.maximumCapacity}
                                </p>
                            )}
                            {event.isFeeRequired && (
                            <div className={styles.feeBlock}>
                                <p>
                                <FontAwesomeIcon icon={faMoneyBill} /> Entry Fee: {(!event.isFeeRequired || event.fee === 0) ? "Free" : event.fee + "₺" }
                                </p>
                                {event.feeDescription && (
                                <p className={styles.feeInfo}> 
                                    <FontAwesomeIcon icon={faInfoCircle} /> Fee Description: {event.feeDescription}
                                </p>
                                )}
                            </div>
                            )}
                            </div>
                    </div>
                </div>
                );
            default: return null
        }
    }

    return (
        <div className={styles.createEventFormContainer}>
            {isDraftEvent &&
            <button onClick={() => navigate(`/event/${event.id}`)} className={styles.backButton}>
                <FontAwesomeIcon icon={faArrowLeft} size="2x" />
                <span>Back to Event Details</span>
            </button>}
            <div className={styles.containerAlt}>
                <div className={styles.stepContainer}>
                    {steps.map( (label,index) => (
                        <div className={styles.stepItem} key={index}>
                            <div className={`${styles.stepCircle} ${step === index + 1 ? styles.stepCircleActive :''}`} onClick={() => setStep(index + 1)}>
                                {index + 1}
                            </div>
                            <span className={styles.stepLabel}>{label}</span>
                            {index !== steps.length - 1 && <div className={styles.stepLine}></div>}
                        </div>
                    ))}
                </div>
                {renderStep()}
                <div  className={styles.buttons}>
                    {step > 1 && <button onClick={() =>handleBack()}> Back</button>}
                    {step < 5 && <button onClick={() => handleNext()}> Next</button>}
                    {step === 5 && 
                    <>
                    <button className={styles.draftButton} onClick={(e) => handleCreateEvent(e, true)}>Save as Draft</button>
                    <button onClick={(e) => handleCreateEvent(e, false)}>Create</button>
                    </>
                    }
                </div>
            </div>   
        </div>
    );
}


export default CreateEventForm;