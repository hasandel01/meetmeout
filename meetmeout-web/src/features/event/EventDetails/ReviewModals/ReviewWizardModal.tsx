import { useState } from "react";
import ReviewModal from "../ReviewModal/ReviewModal";
import UserReviewModal from "../UserRevivewModal/UserReviewModal";
import { Event } from "../../../../types/Event";
import { User } from "../../../../types/User";
import styles from "./ReviewWizardModal.module.css";

interface Props {
  event: Event;
  setEvent: (event: Event | ((prev: Event) => Event)) => void;
  currentUser: User;
  onClose: () => void;
  showFirstStep?: boolean;
  showSecondStep?: boolean;
}

const ReviewWizardModal: React.FC<Props> = ({
  event,
  currentUser,
  onClose,
  setEvent,
  showFirstStep = false,
  showSecondStep = false
}) => {
  const [step, setStep] = useState(
    showFirstStep ? 1 : showSecondStep ? 2 : 0
  );

  const handleNext = () => {
    if (step === 1 && showSecondStep) {
      setStep(2);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (step === 0) return null;

  return (
    <div className={styles.modalOverlay}>
      {step === 1 && (
        <ReviewModal
          event={event}
          currentUser={currentUser}
          setEvent={setEvent}
          onClose={handleNext}
        />
      )}
      {step === 2 && (
        <UserReviewModal
          event={event}
          currentUser={currentUser}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default ReviewWizardModal;
