import { useEffect, useRef, useState } from "react";

interface UseAutoSaveOptions<T> {
  key: string;
  data: T;
  interval?: number; // in milliseconds, default 30000 (30 seconds)
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  lastSaved: Date | null;
  isSaving: boolean;
  clearDraft: () => void;
}

/**
 * Custom hook for auto-saving form data to localStorage
 * @param options Configuration options
 * @returns Auto-save state and controls
 */
export function useAutoSave<T>({
  key,
  data,
  interval = 30000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialDataRef = useRef<string>("");

  // Store initial data to compare for changes
  useEffect(() => {
    if (!initialDataRef.current) {
      initialDataRef.current = JSON.stringify(data);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const saveToLocalStorage = () => {
      const currentData = JSON.stringify(data);
      
      // Only save if data has changed
      if (currentData !== initialDataRef.current) {
        setIsSaving(true);
        
        try {
          localStorage.setItem(key, currentData);
          setLastSaved(new Date());
          console.log(`[AutoSave] Draft saved at ${new Date().toLocaleTimeString()}`);
        } catch (error) {
          console.error("[AutoSave] Failed to save draft:", error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    // Save immediately on first run if data exists
    if (Object.keys(data as any).length > 0) {
      saveToLocalStorage();
    }

    // Set up interval for periodic saves
    intervalRef.current = setInterval(saveToLocalStorage, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [key, data, interval, enabled]);

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
      setLastSaved(null);
      console.log("[AutoSave] Draft cleared");
    } catch (error) {
      console.error("[AutoSave] Failed to clear draft:", error);
    }
  };

  return {
    lastSaved,
    isSaving,
    clearDraft,
  };
}

/**
 * Load saved draft from localStorage
 * @param key Storage key
 * @returns Parsed draft data or null
 */
export function loadDraft<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      console.log("[AutoSave] Draft loaded from localStorage");
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.error("[AutoSave] Failed to load draft:", error);
  }
  return null;
}
