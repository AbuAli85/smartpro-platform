import { useState, useEffect } from "react";

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setWasOffline(isOffline);
      setIsOffline(false);
      
      // Show reconnection toast
      if (wasOffline) {
        console.log("Connection restored");
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log("Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOffline, wasOffline]);

  return { isOffline, wasOffline };
}
