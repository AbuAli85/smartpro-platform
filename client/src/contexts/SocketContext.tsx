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

    // Only enable Socket.IO in development or when explicitly configured
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
    
    if (!isDevelopment) {
      console.log('[Socket.IO] Disabled in production environment');
      // Set as "connected" to avoid showing offline status in production
      setIsConnected(true);
      return;
    }

    // Create single shared socket connection
    const newSocket = io(window.location.origin, {
      transports: ["polling", "websocket"], // Try polling first, then upgrade to websocket
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 3,
      timeout: 30000, // Increase timeout to 30 seconds
      path: "/socket.io",
      autoConnect: true,
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

    // Real-time notification handlers
    newSocket.on("booking:new", (data: { bookingId: number; officeName: string }) => {
      console.log("[Socket.IO] New booking notification:", data);
      toast.info("New Booking", {
        description: `You have a new booking request from ${data.officeName}`,
      });
      // Trigger notification context refetch
      window.dispatchEvent(new CustomEvent('notification:update'));
    });

    newSocket.on("booking:updated", (data: { bookingId: number; status: string }) => {
      console.log("[Socket.IO] Booking updated:", data);
      toast.info("Booking Updated", {
        description: `Your booking status has been updated to ${data.status}`,
      });
      window.dispatchEvent(new CustomEvent('notification:update'));
    });

    newSocket.on("message:new", (data: { messageId: number; from: string; preview: string }) => {
      console.log("[Socket.IO] New message:", data);
      toast.info(`New message from ${data.from}`, {
        description: data.preview,
      });
      window.dispatchEvent(new CustomEvent('notification:update'));
    });

    newSocket.on("office:approved", (data: { officeId: number; officeName: string }) => {
      console.log("[Socket.IO] Office approved:", data);
      toast.success("Office Approved! 🎉", {
        description: `${data.officeName} has been verified and is now live`,
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('notification:update'));
    });

    newSocket.on("office:rejected", (data: { officeId: number; officeName: string; reason: string }) => {
      console.log("[Socket.IO] Office rejected:", data);
      toast.error("Office Registration Rejected", {
        description: data.reason,
        duration: 5000,
      });
      window.dispatchEvent(new CustomEvent('notification:update'));
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
