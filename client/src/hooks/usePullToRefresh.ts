import { useEffect, useRef, useState, useCallback } from 'react';
import { useHapticFeedback } from './useHapticFeedback';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
  resistance?: number;
  enabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

/**
 * Hook for implementing pull-to-refresh gesture on mobile devices
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 150,
  resistance = 2.5,
  enabled = true,
}: PullToRefreshOptions) {
  const { vibrate } = useHapticFeedback();
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false,
  });

  const touchStartY = useRef<number>(0);
  const scrollTop = useRef<number>(0);
  const hasTriggeredHaptic = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || state.isRefreshing) return;

      // Only allow pull-to-refresh when scrolled to top
      const element = e.target as HTMLElement;
      const scrollableParent = findScrollableParent(element);
      scrollTop.current = scrollableParent?.scrollTop || 0;

      if (scrollTop.current === 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    },
    [enabled, state.isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || state.isRefreshing || touchStartY.current === 0) return;

      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;

      // Only pull down
      if (pullDistance > 0) {
        // Apply resistance
        const resistedDistance = Math.min(
          pullDistance / resistance,
          maxPullDistance
        );

        setState((prev) => ({
          ...prev,
          isPulling: true,
          pullDistance: resistedDistance,
          canRefresh: resistedDistance >= threshold,
        }));

        // Trigger haptic feedback when threshold is reached
        if (resistedDistance >= threshold && !hasTriggeredHaptic.current) {
          vibrate('medium');
          hasTriggeredHaptic.current = true;
        }

        // Prevent default scrolling when pulling
        if (pullDistance > 10) {
          e.preventDefault();
        }
      }
    },
    [enabled, state.isRefreshing, threshold, maxPullDistance, resistance, vibrate]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || state.isRefreshing) return;

    if (state.canRefresh) {
      // Trigger refresh
      setState((prev) => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
      }));

      vibrate('success');

      try {
        await onRefresh();
      } catch (error) {
        console.error('[PullToRefresh] Refresh error:', error);
        vibrate('error');
      } finally {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false,
        });
      }
    } else {
      // Reset state
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        canRefresh: false,
      });
    }

    touchStartY.current = 0;
    hasTriggeredHaptic.current = false;
  }, [enabled, state.canRefresh, state.isRefreshing, onRefresh, vibrate]);

  useEffect(() => {
    if (!enabled) return;

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return state;
}

/**
 * Find the scrollable parent element
 */
function findScrollableParent(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  const { overflow, overflowY } = window.getComputedStyle(element);
  const isScrollable = /(auto|scroll)/.test(overflow + overflowY);

  if (isScrollable && element.scrollHeight > element.clientHeight) {
    return element;
  }

  return findScrollableParent(element.parentElement);
}
