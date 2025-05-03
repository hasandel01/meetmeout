import { useEffect } from "react";
import axiosInstance from "../axios/axios";

const OngoingEvents = () => {


    const getEvents = async () => {

        const response = await axiosInstance.get("/get-ongoing-events", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        console.log("Ongoing events:", response.data);
        return response.data;
    };

    useEffect  (() => {
        getEvents()
    ,[]});

    return (
        <div className="ongoing-events">
            <h1>Ongoing Events!</h1>

        </div>
    )

}

export default OngoingEvents;