import { useCallback } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticFeedback {
  vibrate: (pattern?: HapticPattern) => void;
  isSupported: boolean;
}

/**
 * Hook for providing haptic feedback on mobile devices
 * Uses the Vibration API to provide tactile feedback for user interactions
 */
export function useHapticFeedback(): HapticFeedback {
  // Check if vibration API is supported
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  /**
   * Trigger haptic feedback with predefined patterns
   * @param pattern - The type of haptic feedback to trigger
   */
  const vibrate = useCallback((pattern: HapticPattern = 'light') => {
    if (!isSupported) {
      return;
    }

    // Define vibration patterns (in milliseconds)
    // Format: [vibrate, pause, vibrate, pause, ...]
    const patterns: Record<HapticPattern, number | number[]> = {
      // Single vibrations
      light: 10,      // Quick tap
      medium: 20,     // Standard tap
      heavy: 40,      // Strong tap
      
      // Pattern vibrations
      success: [20, 50, 20],           // Double tap for success
      warning: [30, 100, 30, 100, 30], // Triple tap for warning
      error: [50, 100, 50],            // Strong double tap for error
      selection: 15,                    // Light tap for selections
    };

    try {
      const vibrationPattern = patterns[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('[Haptic] Vibration failed:', error);
    }
  }, [isSupported]);

  return {
    vibrate,
    isSupported,
  };
}

/**
 * Utility function to trigger haptic feedback without using the hook
 * Useful for one-off vibrations outside of React components
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  const patterns: Record<HapticPattern, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 40,
    success: [20, 50, 20],
    warning: [30, 100, 30, 100, 30],
    error: [50, 100, 50],
    selection: 15,
  };

  try {
    navigator.vibrate(patterns[pattern]);
  } catch (error) {
    console.warn('[Haptic] Vibration failed:', error);
  }
}

/**
 * Stop any ongoing vibration
 */
export function stopHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(0);
  }
}
