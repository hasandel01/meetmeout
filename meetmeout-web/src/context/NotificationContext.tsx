import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../axios/axios";
import { Notification } from "../types/Notification";
import { useWebSocket } from "./WebSocketContext"; // WebSocket contextini ekle
import { toast } from "react-toastify";
import { useUserContext } from "./UserContext";

interface NotificationContextType {
  notifications: Notification[];
  fetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const page = 0;
  const size = 20;

  const { isConnected, subscribe } = useWebSocket();
  const {currentUser} = useUserContext();

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
  }, []);


  useEffect(() => {
  if (!isConnected || !currentUser?.username) return;

  let unsubscribe = () => {};
  const timeout = setTimeout(() => {
    try {
      unsubscribe = subscribe(`/queue/notifications/${currentUser.username}`, (msg) => {
        const newNotification: Notification = JSON.parse(msg.body);
        toast.info(`🔔 ${newNotification.title}`, {
          onClick: () => window.location.href = newNotification.url,
          autoClose: 5000,
        });
      });
    } catch (error) {
      console.error("❌ WebSocket subscription failed:", error);
    }
  }, 300);

  return () => {
    clearTimeout(timeout);
    unsubscribe?.(); // BU ARTIK ÇALIŞIR
  };
}, [isConnected, currentUser?.username]);



  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
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
