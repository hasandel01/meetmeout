import { Client } from '@stomp/stompjs';
import { createContext, useContext, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client';

interface WebSocketContextType {
  clientRef: React.RefObject<Client | null>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const socket = new SockJS(`${import.meta.env.VITE_SOCKET_BASE_URL}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
        connectHeaders: {
        Authorization: `Bearer ${token}`
        },
      debug: (msg) => console.log('STOMP DEBUG:', msg),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected!');
        toast.success('WebSocket connected ✅');
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.body);
        toast.error('STOMP error');
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ clientRef }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error('useWebSocketContext must be used inside WebSocketProvider');
  return context;
};
