import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface BookingDraftData {
  officeId: number;
  selectedServiceId: string;
  formData: Record<string, any>;
  selectedDate?: Date;
  selectedTime?: string;
  currentStep: number;
  timestamp: number;
}

const DRAFT_KEY_PREFIX = "booking_draft_";
const AUTO_SAVE_INTERVAL = 3000; // Auto-save every 3 seconds
const DRAFT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hook for auto-saving and restoring booking form drafts
 * Prevents data loss when users navigate away or close the browser
 */
export function useBookingDraft(officeId: number) {
  const draftKey = `${DRAFT_KEY_PREFIX}${officeId}`;
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  /**
   * Save draft to localStorage
   */
  const saveDraft = useCallback((data: Omit<BookingDraftData, "timestamp">) => {
    try {
      const draftData: BookingDraftData = {
        ...data,
        timestamp: Date.now(),
      };
      
      const serialized = JSON.stringify(draftData);
      
      // Only save if data has changed
      if (serialized !== lastSavedDataRef.current) {
        localStorage.setItem(draftKey, serialized);
        lastSavedDataRef.current = serialized;
      }
    } catch (error) {
      console.error("Failed to save booking draft:", error);
    }
  }, [draftKey]);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback((): BookingDraftData | null => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return null;

      const draft: BookingDraftData = JSON.parse(saved);
      
      // Check if draft has expired
      if (Date.now() - draft.timestamp > DRAFT_EXPIRY) {
        localStorage.removeItem(draftKey);
        return null;
      }

      // Convert date string back to Date object
      if (draft.selectedDate) {
        draft.selectedDate = new Date(draft.selectedDate);
      }

      return draft;
    } catch (error) {
      console.error("Failed to load booking draft:", error);
      return null;
    }
  }, [draftKey]);

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      lastSavedDataRef.current = "";
    } catch (error) {
      console.error("Failed to clear booking draft:", error);
    }
  }, [draftKey]);

  /**
   * Check if a draft exists
   */
  const hasDraft = useCallback((): boolean => {
    return loadDraft() !== null;
  }, [loadDraft]);

  /**
   * Auto-save draft with debouncing
   */
  const autoSaveDraft = useCallback((data: Omit<BookingDraftData, "timestamp">) => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft(data);
    }, AUTO_SAVE_INTERVAL);
  }, [saveDraft]);

  /**
   * Show draft restoration prompt
   */
  const promptRestoreDraft = useCallback((onRestore: () => void, onDiscard: () => void) => {
    const draft = loadDraft();
    if (!draft) return false;

    // Calculate how long ago the draft was saved
    const minutesAgo = Math.floor((Date.now() - draft.timestamp) / 60000);
    const timeAgoText = minutesAgo < 60 
      ? `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`
      : `${Math.floor(minutesAgo / 60)} hour${Math.floor(minutesAgo / 60) !== 1 ? 's' : ''} ago`;

    toast.info("Draft Found", {
      description: `You have an unfinished booking from ${timeAgoText}. Would you like to continue?`,
      duration: 10000,
      action: {
        label: "Continue",
        onClick: onRestore,
      },
      cancel: {
        label: "Start Fresh",
        onClick: onDiscard,
      },
    });

    return true;
  }, [loadDraft]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    autoSaveDraft,
    promptRestoreDraft,
  };
}

/**
 * Format draft timestamp for display
 */
export function formatDraftAge(timestamp: number): string {
  const minutesAgo = Math.floor((Date.now() - timestamp) / 60000);
  
  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  
  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo}d ago`;
}
