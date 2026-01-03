import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { COOKIE_NAME } from "@shared/const";

type NotificationEvent = {
  type: "connected" | "heartbeat" | "booking_created" | "booking_updated" | "booking_cancelled" | "new_review" | "new_inquiry";
  data: any;
  timestamp: number;
};

export function useNotifications() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5; // Stop after 5 failed attempts

  const connect = () => {
    if (!user) {
      return;
    }

    // Don't create multiple connections
    if (eventSourceRef.current) {
      return;
    }

    try {
      // Get session token from cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${COOKIE_NAME}=`))
        ?.split("=")[1];

      if (!token) {
        if (import.meta.env.DEV) {
          console.warn("SSE: No auth token found");
        }
        return;
      }

      // Create EventSource connection
      const eventSource = new EventSource(`/api/sse/notifications?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (import.meta.env.DEV) {
          console.log("SSE connection established");
        }
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: NotificationEvent = JSON.parse(event.data);
          handleNotification(notification);
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.warn("SSE connection error - will retry", error);
        }
        
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        // Stop reconnecting after max attempts
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          if (import.meta.env.DEV) {
            console.warn(`SSE: Max reconnection attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`);
          }
          return;
        }

        // Attempt to reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (import.meta.env.DEV) {
            console.log(`SSE: Reconnecting (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          }
          connect();
        }, delay);
      };
    } catch (error) {
      console.error("Error creating SSE connection:", error);
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  };

  const handleNotification = (notification: NotificationEvent) => {
    switch (notification.type) {
      case "connected":
        // Connection established
        break;

      case "heartbeat":
        // Keep-alive ping
        break;

      case "booking_created":
        toast.success("New Booking!", {
          description: `You have a new booking request from ${notification.data.customerName || "a customer"}.`,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/office-dashboard";
            },
          },
        });
        break;

      case "booking_updated":
        const statusMessages: Record<string, string> = {
          confirmed: "Your booking has been confirmed!",
          in_progress: "Your service is now in progress.",
          completed: "Your booking has been completed!",
          cancelled: "Your booking has been cancelled.",
        };
        const message = statusMessages[notification.data.status] || "Your booking status has been updated.";
        
        toast.info("Booking Update", {
          description: message,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/bookings";
            },
          },
        });
        break;

      case "booking_cancelled":
        toast.warning("Booking Cancelled", {
          description: `Booking #${notification.data.bookingId} has been cancelled.`,
        });
        break;

      case "new_review":
        toast.info("New Review", {
          description: `You received a ${notification.data.rating}-star review!`,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/office-dashboard";
            },
          },
        });
        break;

      case "new_inquiry":
        toast.info("New Inquiry", {
          description: "You have a new customer inquiry.",
          action: {
            label: "View",
            onClick: () => {
              window.location.href = "/office-dashboard";
            },
          },
        });
        break;

      default:
        console.log("Unknown notification type:", notification.type);
    }
  };

  // Connect when user is authenticated
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [user]);

  return {
    isConnected,
    connect,
    disconnect,
  };
}
