import "../styles/MainFeed.css";
import { useState } from "react";
import OngoingEvents from "./OngoingEvents";

const MainFeed = () => {
 
    return (
        <div className="main-feed">
            <OngoingEvents />
        <footer>
            <p>&copy; 2025 MeetMeOut. All rights reserved.</p>
        </footer>
        </div>
    );
}

export default MainFeed;
