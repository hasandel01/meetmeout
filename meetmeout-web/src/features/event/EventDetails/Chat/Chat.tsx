import { useState, useEffect } from "react";
import { Message } from "../../../../types/Message";
import styles from "./Chat.module.css"
import { useUserContext } from "../../../../context/UserContext";

import {toast} from 'react-toastify';
import axiosInstance from "../../../../axios/axios";
import { useWebSocketContext } from "../../../../context/WebSocketContext";

interface ChatProps {
    eventId: number
}

const Chat: React.FC<ChatProps> = ({eventId}) => {

      const {currentUser} = useUserContext();
      const [messages, setMessages] = useState<Message[]>([]);
        const [newMessage, setNewMessage] = useState<Message>({
        user: currentUser!,
        message: ""
        });

     const {clientRef} = useWebSocketContext(); 


      useEffect(() => {
        if (eventId !== 0) {
            getMessagesForEvent();
        }
      },[eventId])



    const sendMessage = () => {
  
        if (!clientRef.current || !clientRef.current.connected) {
        return;
        }
        
        if(newMessage.message.trim() === "") {
            toast.warn("Cannot send an empty message!")
            return
        }
        
        clientRef.current.publish({
        destination: `/app/chat/event/${eventId}`,
        body: JSON.stringify(newMessage)
        });

        setNewMessage({ user: currentUser!, message: "" });

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
                <label>Chat</label>
                    <ul className={styles.messageList}>
                        {messages.map( (message, index) => (
                            <li key={index} className={styles.chatMessage}>
                                <img src={message.user.profilePictureUrl}></img>
                                <h5>{message.message}</h5>
                            </li>
                        ))}
                    </ul>
                    <div className={styles.sendChatMessageContainer}>
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
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter')
                                        sendMessage()
                                }}
                            />
                        </div>
                    </div>             
              </div>  
    )
}

export default Chat;