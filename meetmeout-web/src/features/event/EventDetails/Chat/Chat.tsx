import { useState, useRef, useEffect } from "react";
import { Message } from "../../../../types/Message";
import styles from "./Chat.module.css"
import { useUserContext } from "../../../../context/UserContext";
import SockJS from 'sockjs-client';
import { Client} from "@stomp/stompjs";
import {toast} from 'react-toastify';
import axiosInstance from "../../../../axios/axios";

interface ChatProps {
    eventId: number
}

const Chat: React.FC<ChatProps> = ({eventId}) => {

      const {currentUser} = useUserContext();
      const [messages, setMessages] = useState<Message[]>([]);
      const [newMessage, setNewMessage] = useState<Message>();

      const clientRef = useRef<Client | null>(null);


      useEffect(() => {
        if (eventId !== 0) {
            getMessagesForEvent();
        }
      },[eventId])


      
      useEffect(() => {
            console.log("Trying to connect WebSocket...");
            const token = localStorage.getItem("accessToken");
            const baseUrl = import.meta.env.VITE_SOCKET_BASE_URL;

            console.log("WebSocket URL:", `${baseUrl}/ws?token=${token}`);

            const socket = new SockJS(`${baseUrl}/ws?token=${token}`);
            const client = new Client({
                webSocketFactory: () => socket,
                reconnectDelay: 5000,
                onConnect: () => {
                toast.success("Connected to the WebSocketServer!");
                },
                onStompError: (frame) => {
                console.error("STOMP Error", frame);
                },
                onWebSocketError: (event) => {
                console.error("WebSocket Error", event);
                },
                onDisconnect: () => {
                console.warn("Disconnected from WebSocket");
                },
            });

            clientRef.current = client;
            client.activate();

            return () => {
                client.deactivate();
            };
            }, [eventId]);

      

    const sendMessage = () => {
  
        if (!clientRef.current || !clientRef.current.connected) {
        return;
        }
        
        clientRef.current.publish({
        destination: `/app/chat/event/${eventId}`,
        body: JSON.stringify(newMessage)
        });

    }

      const getMessagesForEvent = async () => {
    
        try {
          const response = await axiosInstance.get(`/get-chat-messages/${eventId}`)
            setMessages(prev => [...prev, ...response.data]);
        } catch(error) {
          toast.error("Error getting event messages")
        }
    
      }

    return (
            <div className={styles.chatContainer}>
                <h4>Event Chat</h4>
                    <ul className={styles.messageList}>
                        {messages.map( (message, index) => (
                            <li key={index} className={styles.chatMessage}>
                                <img src={message.user.profilePictureUrl}></img>
                                <h5>{message.message}</h5>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.sendChatMessageContainer}>
                        <hr/>
                        <div className={styles.sendChatMessage}>
                            <input
                                type="text"
                                placeholder="Enter a message"
                                value={newMessage?.message}
                                onChange={(e) => {
                                if (currentUser) {
                                    setNewMessage({ user: currentUser, message: e.target.value });
                                }
                                }}
                                required
                            />
                            <button onClick={sendMessage}> Send </button>
                        </div>
                    </div>             
              </div>  
    )
}

export default Chat;