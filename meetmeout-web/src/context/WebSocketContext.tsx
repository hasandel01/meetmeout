import { createContext, useContext, useRef, useEffect, useState } from "react";
import { Client, IMessage, StompHeaders } from "@stomp/stompjs";
import { toast } from "react-toastify";

interface WebSocketContextType {
  client: Client | null;
  isConnected: boolean;
  subscribe: (destination: string, callback: (message: IMessage) => void, headers?: StompHeaders) => () => void;
  send: (destination: string, body: string, headers?: StompHeaders) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const subscribe = (destination: string, callback: (message: IMessage) => void, headers?: StompHeaders) => {
   if (!clientRef.current || !clientRef.current.connected) {
      console.warn("❌ Tried to subscribe, but WebSocket is not connected yet.");
      return () => {};
    }
    const subscription = clientRef.current.subscribe(destination, callback, headers);
    return () => subscription.unsubscribe();
  };

  const send = (destination: string, body: string, headers?: StompHeaders) => {
    if (!clientRef.current || !isConnected) {
      throw new Error("WebSocket not connected");
    }
    clientRef.current.publish({ destination, body, headers });
  };

  useEffect(() => {
    const initializeWebSocket = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Access token not found");
        return;
      }
      const socketUrl = `wss://192.168.1.42:9000/ws`;

      const client = new Client({
        webSocketFactory: () => new WebSocket(socketUrl),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          setIsConnected(true);
          reconnectAttempts.current = 0;
          console.log("WebSocket connected");
        },

        onDisconnect: () => {
          setIsConnected(false);
          console.log("WebSocket disconnected");
        },

        onStompError: (frame) => {
          console.error("STOMP error:", frame.headers.message);
          if (frame.headers.message?.includes("401")) {
            toast.error("Authentication failed - please login again");
            client.deactivate();
          }
        },

        onWebSocketError: (event) => {
          console.error("WebSocket error:", event);
          reconnectAttempts.current += 1;
          if (reconnectAttempts.current >= maxReconnectAttempts) {
            toast.error("WebSocket connection failed after multiple attempts");
            client.deactivate();
          }
        },
      });

      clientRef.current = client;
      client.activate();

      return () => {
        client.deactivate();
        setIsConnected(false);
      };
    };

    initializeWebSocket();

    if (import.meta.hot) {
      import.meta.hot.on("vite:beforeUpdate", () => {
        if (clientRef.current?.active) {
          clientRef.current.deactivate();
        }
      });
    }
  }, []);

  const contextValue: WebSocketContextType = {
    client: clientRef.current,
    isConnected,
    subscribe,
    send,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
