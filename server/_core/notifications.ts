import { Response } from "express";
import { EventEmitter } from "events";

// Event types for notifications
export type NotificationEvent = {
  type: "booking_created" | "booking_updated" | "booking_cancelled" | "new_review" | "new_inquiry";
  userId: number;
  data: any;
  timestamp: number;
};

// Global event emitter for notifications
class NotificationEmitter extends EventEmitter {
  // Emit a notification event
  emitNotification(event: NotificationEvent) {
    this.emit(`user:${event.userId}`, event);
    // Also emit to a global channel for admins
    this.emit("admin:all", event);
  }

  // Subscribe to user-specific notifications
  subscribeUser(userId: number, callback: (event: NotificationEvent) => void) {
    this.on(`user:${userId}`, callback);
  }

  // Subscribe to all notifications (for admins)
  subscribeAdmin(callback: (event: NotificationEvent) => void) {
    this.on("admin:all", callback);
  }

  // Unsubscribe from user notifications
  unsubscribeUser(userId: number, callback: (event: NotificationEvent) => void) {
    this.off(`user:${userId}`, callback);
  }

  // Unsubscribe from admin notifications
  unsubscribeAdmin(callback: (event: NotificationEvent) => void) {
    this.off("admin:all", callback);
  }
}

export const notificationEmitter = new NotificationEmitter();

// SSE connection manager
export class SSEConnection {
  private res: Response;
  private userId: number;
  private isAdmin: boolean;
  private heartbeatInterval: NodeJS.Timeout;
  private eventHandler: (event: NotificationEvent) => void;

  constructor(res: Response, userId: number, isAdmin: boolean = false) {
    this.res = res;
    this.userId = userId;
    this.isAdmin = isAdmin;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering

    // Send initial connection message
    this.sendEvent({
      type: "connected",
      data: { message: "Connected to notification stream" },
    });

    // Set up event handler
    this.eventHandler = (event: NotificationEvent) => {
      this.sendEvent({
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      });
    };

    // Subscribe to notifications
    if (this.isAdmin) {
      notificationEmitter.subscribeAdmin(this.eventHandler);
    } else {
      notificationEmitter.subscribeUser(this.userId, this.eventHandler);
    }

    // Set up heartbeat to keep connection alive
    this.heartbeatInterval = setInterval(() => {
      this.sendEvent({ type: "heartbeat", data: { timestamp: Date.now() } });
    }, 30000); // Every 30 seconds

    // Clean up on connection close
    res.on("close", () => {
      this.cleanup();
    });
  }

  private sendEvent(event: { type: string; data: any; timestamp?: number }) {
    try {
      const data = JSON.stringify({
        ...event,
        timestamp: event.timestamp || Date.now(),
      });
      this.res.write(`data: ${data}\n\n`);
    } catch (error) {
      console.error("Error sending SSE event:", error);
    }
  }

  private cleanup() {
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Unsubscribe from notifications
    if (this.isAdmin) {
      notificationEmitter.unsubscribeAdmin(this.eventHandler);
    } else {
      notificationEmitter.unsubscribeUser(this.userId, this.eventHandler);
    }
  }
}

// Helper function to emit booking notifications
export function emitBookingNotification(
  type: "booking_created" | "booking_updated" | "booking_cancelled",
  userId: number,
  bookingData: any
) {
  notificationEmitter.emitNotification({
    type,
    userId,
    data: bookingData,
    timestamp: Date.now(),
  });
}

// Helper function to emit review notifications
export function emitReviewNotification(officeOwnerId: number, reviewData: any) {
  notificationEmitter.emitNotification({
    type: "new_review",
    userId: officeOwnerId,
    data: reviewData,
    timestamp: Date.now(),
  });
}

// Helper function to emit inquiry notifications
export function emitInquiryNotification(officeOwnerId: number, inquiryData: any) {
  notificationEmitter.emitNotification({
    type: "new_inquiry",
    userId: officeOwnerId,
    data: inquiryData,
    timestamp: Date.now(),
  });
}
