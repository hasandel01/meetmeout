import { useProfileContext } from "../../../../context/ProfileContext";
import { JoinRequest } from "../../../../types/JoinRequest";
import styles from "./RequesterContainerModal.module.css"
import axiosInstance from "../../../../axios/axios";
import {toast} from 'react-toastify';

interface RequesterContainerModalProps {
    onClose: () => void;
    requests: JoinRequest[];
}


const RequesterContainerModal: React.FC<RequesterContainerModalProps> = ({requests, onClose}) => {
  
    const {goToUserProfile} = useProfileContext();

      const handleAcceptJoinRequest = async (eventId: number, username: string) => {
    try {
        await axiosInstance.post(`/events/${eventId}/${username}/accept-request`)
    } catch(error)  {
      toast.error("Error accepting join request!")
    }
  }

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                        Requesters ({requests.length})
                </div>
                <div className={styles.requesterList}>
                        {requests.map(request => (
                                    <div key={request.user.username} className={styles.requesterCard} onClick={(e) => {
                                        e.stopPropagation()
                                        goToUserProfile(request.user.username)}}>
                                        <img src={request.user.profilePictureUrl} alt="profile-picture"></img>
                                            <div>
                                                <h4>{request.user.firstName}  {request.user.lastName}</h4>
                                                <strong>@{request.user.username}</strong>
                                        </div>
                                        <button onClick={() => handleAcceptJoinRequest(request.eventId, request.user.username)}>
                                        Accept
                                        </button>
                                    </div>
                                ))} 
                </div>
                    
            <button onClick={() => onClose()} className={styles.closeButton}> Close </button>
            </div>
           
        </div>
    );
}


export default RequesterContainerModal;