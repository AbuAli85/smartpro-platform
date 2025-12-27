import { createContext, useContext, ReactNode, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useSocket } from "./SocketContext";

interface NotificationContextType {
  unreadCount: number;
  bookingCount: number;
  messageCount: number;
  isLoading: boolean;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  bookingCount: 0,
  messageCount: 0,
  isLoading: false,
  refetch: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  // Single source of truth for notification counts
  // Only poll when socket is NOT connected (fallback)
  // When socket is connected, rely on real-time updates
  const { data: notificationCounts, isLoading, refetch } = trpc.auth.getNotificationCounts.useQuery(
    undefined,
    { 
      enabled: !!user,
      // Reduce polling frequency significantly
      refetchInterval: isConnected ? false : 60000, // Only poll every 60s when offline
      staleTime: 30000, // Consider data fresh for 30s
    }
  );

  // Listen for real-time notification updates from Socket.IO
  useEffect(() => {
    const handleNotificationUpdate = () => {
      console.log('[Notifications] Real-time update received, refetching...');
      refetch();
    };

    window.addEventListener('notification:update', handleNotificationUpdate);
    return () => {
      window.removeEventListener('notification:update', handleNotificationUpdate);
    };
  }, [refetch]);

  const value: NotificationContextType = {
    unreadCount: notificationCounts?.unreadNotifications || 0,
    bookingCount: notificationCounts?.pendingBookings || 0,
    messageCount: notificationCounts?.unreadMessages || 0,
    isLoading,
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
