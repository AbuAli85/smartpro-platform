import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribeMutation = trpc.notification.subscribeToPush.useMutation();
  const unsubscribeMutation = trpc.notification.unsubscribeFromPush.useMutation();

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error("Failed to check subscription:", err);
    }
  };

  const subscribe = async () => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser");
      return false;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notification permission denied");
        return false;
      }

      // Register service worker if not already registered
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }

      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
      });

      // Send subscription to server
      await subscribeMutation.mutateAsync({
        subscription: JSON.parse(JSON.stringify(sub)),
      });

      setSubscription(sub);
      setIsSubscribed(true);
      setError(null);
      return true;
    } catch (err: any) {
      console.error("Failed to subscribe to push notifications:", err);
      setError(err.message || "Failed to subscribe to push notifications");
      return false;
    }
  };

  const unsubscribe = async () => {
    if (!subscription) {
      return false;
    }

    try {
      await subscription.unsubscribe();
      
      // Notify server
      await unsubscribeMutation.mutateAsync({
        endpoint: subscription.endpoint,
      });

      setSubscription(null);
      setIsSubscribed(false);
      setError(null);
      return true;
    } catch (err: any) {
      console.error("Failed to unsubscribe from push notifications:", err);
      setError(err.message || "Failed to unsubscribe");
      return false;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    error,
    subscribe,
    unsubscribe,
  };
}
