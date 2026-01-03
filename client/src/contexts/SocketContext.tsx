import { createContext, useContext, ReactNode } from "react";

/**
 * Socket.IO has been removed from this project.
 * This file contains stub implementations to prevent import errors.
 * Real-time features are implemented using SSE (Server-Sent Events) instead.
 * 
 * The platform uses SSE for real-time notifications via useNotifications hook.
 */

interface SocketContextType {
  socket: null;
  isConnected: boolean;
  emitWithQueue: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: true, // Always show as "connected" since we use SSE
  emitWithQueue: () => {
    console.log("[Socket] Stub: emitWithQueue called - using SSE instead");
  },
});

export function useSocket() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const value: SocketContextType = {
    socket: null,
    isConnected: true, // Always show as connected since we use SSE for real-time updates
    emitWithQueue: (event: string, data: any) => {
      console.log(`[Socket] Stub: emitWithQueue - ${event}`, data);
      // Real-time features should use SSE or direct tRPC mutations instead
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
