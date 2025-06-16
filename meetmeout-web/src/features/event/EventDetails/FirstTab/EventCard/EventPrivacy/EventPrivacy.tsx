import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import styles from "./EventPrivacy.module.css";
import { User } from "../../../../../../types/User";
import { Event } from "../../../../../../types/Event";
import axiosInstance from "../../../../../../axios/axios";
import {toast} from "react-toastify";

interface EventPrivacyProps {
    event: Event;
    currentUser: User;
    setEvent: Dispatch<SetStateAction<Event>>;
}

const EventPrivacy: React.FC<EventPrivacyProps> = ({currentUser, event, setEvent}) => {

    const [showChangePrivacyModal, setShowChangePrivacyModal] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
        
    useEffect(() => {
        
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            setShowChangePrivacyModal(false);
            }
        };
        
        if (showChangePrivacyModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showChangePrivacyModal]);


    const handleChangePrivacy = async () => {
        try {
            
            await axiosInstance.put(`/events/${event.id}/privacy`)

            setEvent(prev => ({
                ...prev,
                isPrivate: !prev.isPrivate
            }))

            toast.success(`Event is now ${event.isPrivate ? 'public' : 'private'}.`);

        }catch(error) {
            console.log(error)
        }
    }

    return (
        <div className={styles.lockContainer}>
            <span
                className={styles.lockIcon}
                data-tooltip-id="private_event_tooltip"
                data-tooltip-content={event.isPrivate ? "Private Event" : "Public Event"}
                onClick={currentUser?.username === event.organizer?.username ? () => setShowChangePrivacyModal(prev => !prev) : undefined}
                style={currentUser?.username === event.organizer?.username ? { cursor: "pointer" }: {}}
            >
                <FontAwesomeIcon icon={event.isPrivate ? faLock : faLockOpen} style={event.isPrivate ? {} : {opacity: "0.3"}} />
            </span>
            <Tooltip id="private_event_tooltip" />
            {showChangePrivacyModal &&
                <div className={styles.privacyChangeModalOverlay}>
                    <div className={styles.deleteEventModal} ref={modalRef}>
                    <h4> Are you sure to change the event privacy to {event.isPrivate ? "public": "private"}?</h4>
                    {!event.isPrivate && <p>All the current attendees are preserved and won't be affected by the change.</p>}
                        <div className={styles.deleteEventModalButtons}>
                                            <button
                                            className={styles.confirmButton}
                                            onClick={() => {
                                                setShowChangePrivacyModal(false);
                                                handleChangePrivacy();
                                            }}
                                            >
                                            Yes
                                            </button>
                                            <button
                                            className={styles.cancelButton}
                                            onClick={() => setShowChangePrivacyModal(false)}
                                            >
                                            Cancel
                                            </button>
                                        </div>
                                        </div>
                </div>}
        </div>
    )
}
    

export default EventPrivacy;