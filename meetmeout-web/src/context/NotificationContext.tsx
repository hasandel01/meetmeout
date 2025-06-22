import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../axios/axios";
import { Notification } from "../types/Notification";
import { useWebSocket } from "./WebSocketContext"; // WebSocket contextini ekle
import { useUserContext } from "./UserContext";

interface NotificationContextType {
  notifications: Notification[];
  fetchNotifications: () => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const page = 0;
  const size = 20;
  const [selectedFilter, setSelectedFilter] = useState('all');


  const { isConnected, subscribe } = useWebSocket();
  const {currentUser} = useUserContext();

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}&filter=${selectedFilter}`);
      setNotifications(response.data.content);
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedFilter]);


  useEffect(() => {
  if (!isConnected || !currentUser?.username) return;

  let unsubscribe = () => {};
  const timeout = setTimeout(() => {
    try {
      unsubscribe = subscribe(`/queue/notifications/${currentUser.username}`, (msg) => {
        const newNotification: Notification = JSON.parse(msg.body);
        setNotifications((prev) => [newNotification,...prev])
      });
    } catch (error) {
      console.error("❌ WebSocket subscription failed:", error);
    }
  }, 300);

  return () => {
    clearTimeout(timeout);
    unsubscribe?.(); 
  };
}, [isConnected, currentUser?.username]);



  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications, selectedFilter, setSelectedFilter }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used inside NotificationProvider");
  }
  return context;
};
