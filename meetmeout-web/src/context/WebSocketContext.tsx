import { Client } from '@stomp/stompjs';
import { createContext, useContext, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

interface WebSocketContextType {
  clientRef: React.RefObject<Client | null>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const client = new Client({
      brokerURL: `wss://192.168.1.34:8443/ws?token=${token}`,
      debug: (msg) => console.log('🐛 STOMP DEBUG:', msg),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ STOMP CONNECTED via Native WebSocket!');
      },
      onStompError: (frame) => {
        console.error('❌ STOMP ERROR:', frame.body);
        toast.error('STOMP bağlantı hatası!');
      },
      onWebSocketError: (event) => {
        console.error('❌ WebSocket bağlantı hatası:', event);
        toast.error('WebSocket bağlantı hatası!');
      },
    });

    clientRef.current = client;
    console.log('🚀 client.activate() çağrıldı (Native WebSocket)');
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
  if (!context) {
    throw new Error('useWebSocketContext must be used inside WebSocketProvider');
  }
  return context;
};
