import { useState, useEffect } from "react";
import { Message } from "../../../../types/Message";
import styles from "./Chat.module.css"
import { useUserContext } from "../../../../context/UserContext";
import {toast} from 'react-toastify';
import axiosInstance from "../../../../axios/axios";
import { useWebSocket } from "../../../../context/WebSocketContext";
import formatTime from "../../../../utils/formatTime";
import { Event } from "../../../../types/Event";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

interface ChatProps {
    event: Event
}

const Chat: React.FC<ChatProps> = ({event}) => {

      const {currentUser} = useUserContext();
      const [messages, setMessages] = useState<Message[]>([]);
        const [newMessage, setNewMessage] = useState<Message>({
        user: currentUser!,
        message: "",
        timestamp: ""
        });

    const {client} = useWebSocket(); 
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    };

        
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


      useEffect(() => {
        if (event.id !== 0) {
            getMessagesForEvent();
        }
      },[event.id])

      useEffect(() => {
    if (!client || !client.connected) return;

    const subscription = client.subscribe(`/topic/chat/event/${event.id}`, (message) => {
        const received: Message = JSON.parse(message.body);
        setMessages((prev) => [...prev, received]);
    });

    return () => {
        subscription.unsubscribe();
    };
}, [client, event.id]);


    const sendMessage = () => {
    if (!client || !client.connected) return;
    
    if (newMessage.message.trim() === "") {
        toast.warn("Cannot send an empty message!");
        return;
    }

        client.publish({
            destination: `/app/chat/event/${event.id}`,
            body: JSON.stringify(newMessage)
        });

    setNewMessage({ user: currentUser!, message: "", timestamp: "" });
}

      const getMessagesForEvent = async () => {
    
        try {
          const response = await axiosInstance.get(`/get-chat-messages/${event.id}`)
            setMessages(response.data); 
        } catch(error) {
          toast.error("Error getting event messages")
        }
    
      }

    return (
            <div className={styles.chatContainer}>
                <label>Chat</label>
                    <ul className={styles.messageList}>
                        {messages.length === 0 ? (
                            <div className={styles.emptyChatMessage} >
                            No chatting yet – start a conversation ✨
                            </div>
                        ) : (
                            messages.map((message, index) => (
                            <li
                                key={index}
                                className={
                                message.user.username !== currentUser?.username
                                    ? styles.otherChat
                                    : styles.ownChat
                                }
                            >
                                <div className={styles.avatar}>
                                <img src={message.user.profilePictureUrl} alt="avatar" 
                                            title={message.user.username}
                                            onClick={() => navigate(`/user-profile/${message.user.username}`)} />
                                </div>
                                <div className={styles.messageBubble}>
                                <p className={styles.messageText}>{message.message}</p>
                                <span className={styles.timestamp}>
                                    {message.timestamp ? formatTime(message.timestamp) : "–"}
                                </span>
                                </div>
                            </li>
                            ))
                        )}
                                            <div ref={messagesEndRef} />

                    </ul>
                    <div className={styles.sendChatMessageContainer}>
                        <div className={styles.sendChatMessage}>
                            <textarea
                                maxLength={1000}
                                minLength={1}
                                rows={2}
                                placeholder={!event.attendees.some(attendee => attendee.username === currentUser?.username) 
                                    ? "Only participants can send a message" 
                                    : "Enter a message"}
                                value={newMessage?.message}
                                onChange={(e) => {
                                if (currentUser) {
                                    setNewMessage({ user: currentUser, message: e.target.value, timestamp: "" });
                                }
                                }}
                                required
                                onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                                }}
                                disabled={!event.attendees.some(attendee => attendee.username === currentUser?.username)}
                            />
                        </div>
                    </div>             
              </div>  
    )
}

export default Chat;