import { useProfileContext } from "../../../../context/ProfileContext";
import { JoinRequest } from "../../../../types/JoinRequest";
import styles from "./RequesterContainerModal.module.css"

interface RequesterContainerModalProps {
    onClose: () => void;
    requests: JoinRequest[];
}


const RequesterContainerModal: React.FC<RequesterContainerModalProps> = ({requests, onClose}) => {
  
    const {goToUserProfile} = useProfileContext();

    return (
        <div className={styles.modalContainer}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                        Requesters ({requests.length})
                </div>
                <div className={styles.requesterList}>
                        {requests.map(request => (
                                    <div key={request.user.username} className={styles.requesterCard} onClick={() => goToUserProfile(request.user.username)}>
                                        <img src={request.user.profilePictureUrl} alt="profile-picture"></img>
                                            <div>
                                                <h4>{request.user.firstName}  {request.user.lastName}</h4>
                                                <strong>@{request.user.username}</strong>
                                        </div>
                                    </div>
                                ))} 
                </div>
                    
            <button onClick={() => onClose()} className={styles.closeButton}> Close </button>
            </div>
           
        </div>
    );
}


export default RequesterContainerModal;