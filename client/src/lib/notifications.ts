/**
 * Browser Push Notification Utility
 * Handles requesting permission and sending notifications for chat messages
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and permitted
 */
export function canSendNotifications(): boolean {
  return (
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

/**
 * Send a browser notification
 */
export function sendNotification(options: NotificationOptions): Notification | null {
  if (!canSendNotifications()) {
    console.warn("Cannot send notification: permission not granted");
    return null;
  }

  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || "/favicon.ico",
    tag: options.tag,
    data: options.data,
    badge: "/favicon.ico",
    requireInteraction: false,
  });

  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10000);

  return notification;
}

/**
 * Send a chat message notification
 */
export function sendChatNotification(
  senderName: string,
  message: string,
  conversationId: number,
  onClick?: () => void
): Notification | null {
  const notification = sendNotification({
    title: `New message from ${senderName}`,
    body: message.length > 100 ? message.substring(0, 100) + "..." : message,
    tag: `chat-${conversationId}`,
    data: { conversationId, type: "chat" },
  });

  if (notification && onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  return notification;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}
