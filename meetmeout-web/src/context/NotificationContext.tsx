import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../axios/axios";
import { Notification } from "../types/Notification";


interface NotificationContextType {
    notifications: Notification[],
    fetchNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export const NotificationProvider = ({children}: {children: React.ReactNode}) =>  {

    const [notifications, setNotifications] = useState<Notification[]>([])
    const page = 0;
    const size = 20;

    const fetchNotifications = async () => {
        try {
        const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`);
        setNotifications(response.data.content);
        } catch (error) {
        console.error("Error fetching notifications", error);
        }
    
    };
    
    useEffect(() => {
        fetchNotifications();
    }, [])


    return (
        <NotificationContext.Provider value={{notifications, fetchNotifications}}>
            {children}
        </NotificationContext.Provider>
    )

}

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);

    if(!context) {
    throw new Error("useNotificationContext must be used inside NotificationProvider");
    }

    return context
}

