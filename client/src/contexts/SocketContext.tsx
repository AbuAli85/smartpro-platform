import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface QueuedEvent {
  event: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitWithQueue: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  emitWithQueue: () => {},
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventQueueRef = useRef<QueuedEvent[]>([]);
  const processingQueueRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create single shared socket connection
    const newSocket = io({
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("[Socket.IO] Connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket.IO] Connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("[Socket.IO] Reconnected after", attemptNumber, "attempts");
      toast.success("Connection restored", {
        description: "Real-time updates are now active",
      });
      // Process queued events after reconnection
      processEventQueue(newSocket);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("[Socket.IO] Cleaning up connection");
      newSocket.disconnect();
    };
  }, [user?.id]); // Only recreate if user ID changes

  // Process queued events when connection is restored
  const processEventQueue = (socketInstance: Socket) => {
    if (processingQueueRef.current || eventQueueRef.current.length === 0) return;

    processingQueueRef.current = true;
    console.log("[Socket.IO] Processing", eventQueueRef.current.length, "queued events");

    const queue = [...eventQueueRef.current];
    eventQueueRef.current = [];

    queue.forEach((queuedEvent) => {
      try {
        socketInstance.emit(queuedEvent.event, queuedEvent.data);
        console.log("[Socket.IO] Sent queued event:", queuedEvent.event);
      } catch (error) {
        console.error("[Socket.IO] Failed to send queued event:", error);
        // Re-queue if failed and retry count is low
        if (queuedEvent.retryCount < 3) {
          eventQueueRef.current.push({
            ...queuedEvent,
            retryCount: queuedEvent.retryCount + 1,
          });
        }
      }
    });

    processingQueueRef.current = false;
  };

  // Emit with automatic queueing for offline scenarios
  const emitWithQueue = (event: string, data: any) => {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.log("[Socket.IO] Queueing event (offline):", event);
      eventQueueRef.current.push({
        event,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      });

      // Show toast notification
      if (eventQueueRef.current.length === 1) {
        toast.warning("Connection lost", {
          description: "Your actions will be sent when connection is restored",
        });
      }
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, emitWithQueue }}>
      {children}
    </SocketContext.Provider>
  );
}
