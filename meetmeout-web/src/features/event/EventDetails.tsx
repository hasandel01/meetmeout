import { useParams } from "react-router-dom";

const EventDetails = () => {

  const eventId = useParams<({eventId: string})>()

  const eventIdNumber = parseInt(eventId, 10);



  return (
    <div>
      <h1>Event Details</h1>
      <p>Details about the event will go here.</p>
    </div>
  );
}


export default EventDetails;