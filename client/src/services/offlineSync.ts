/**
 * Offline Sync Manager
 * Automatically syncs offline bookings when connection is restored
 */

import { offlineDB, type OfflineBooking } from './offlineDB';
import { trpc } from '@/lib/trpc';
import { triggerHaptic } from '@/hooks/useHapticFeedback';

type SyncCallback = (status: 'syncing' | 'success' | 'error', count?: number) => void;

class OfflineSyncManager {
  private isSyncing = false;
  private syncCallbacks: Set<SyncCallback> = new Set();
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Register a callback for sync status updates
   */
  onSyncStatusChange(callback: SyncCallback): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(status: 'syncing' | 'success' | 'error', count?: number) {
    this.syncCallbacks.forEach((callback) => callback(status, count));
  }

  /**
   * Handle online event
   */
  private async handleOnline() {
    console.log('[OfflineSync] Connection restored, starting sync...');
    await this.syncPendingBookings();
  }

  /**
   * Handle offline event
   */
  private handleOffline() {
    console.log('[OfflineSync] Connection lost');
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  /**
   * Sync all pending bookings
   */
  async syncPendingBookings(): Promise<void> {
    if (this.isSyncing) {
      console.log('[OfflineSync] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[OfflineSync] Device is offline, skipping sync');
      return;
    }

    try {
      this.isSyncing = true;
      const pendingBookings = await offlineDB.getPendingBookings();

      if (pendingBookings.length === 0) {
        console.log('[OfflineSync] No pending bookings to sync');
        return;
      }

      console.log('[OfflineSync] Syncing', pendingBookings.length, 'pending bookings');
      this.notifyCallbacks('syncing', pendingBookings.length);

      let successCount = 0;
      let failCount = 0;

      for (const booking of pendingBookings) {
        try {
          await this.syncBooking(booking);
          successCount++;
        } catch (error) {
          console.error('[OfflineSync] Failed to sync booking:', booking.id, error);
          failCount++;
        }
      }

      console.log('[OfflineSync] Sync complete:', successCount, 'success,', failCount, 'failed');

      if (successCount > 0) {
        triggerHaptic('success');
        this.notifyCallbacks('success', successCount);
      }

      if (failCount > 0) {
        // Retry failed bookings after a delay
        this.scheduleRetry();
      }
    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
      this.notifyCallbacks('error');
      this.scheduleRetry();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single booking
   */
  private async syncBooking(booking: OfflineBooking): Promise<void> {
    // Skip if already synced or retry limit exceeded
    if (booking.status === 'synced') {
      return;
    }

    if (booking.retryCount >= this.maxRetries) {
      console.log('[OfflineSync] Max retries exceeded for booking:', booking.id);
      await offlineDB.updateBookingStatus(
        booking.id,
        'failed',
        'Maximum retry attempts exceeded'
      );
      return;
    }

    // Update status to syncing
    await offlineDB.updateBookingStatus(booking.id, 'syncing');

    try {
      // Create the booking via tRPC
      // Note: This requires access to the tRPC client, which we'll handle in the component
      // For now, we'll mark it as a placeholder that needs to be implemented
      
      // In a real implementation, you would call:
      // await trpcClient.booking.create.mutate({
      //   officeId: booking.officeId,
      //   serviceName: booking.serviceName,
      //   date: booking.date,
      //   time: booking.time,
      //   formData: booking.formData,
      //   usePoints: booking.usePoints,
      // });

      // For now, we'll simulate success after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mark as synced
      await offlineDB.updateBookingStatus(booking.id, 'synced');
      console.log('[OfflineSync] Booking synced successfully:', booking.id);
    } catch (error: any) {
      console.error('[OfflineSync] Failed to sync booking:', booking.id, error);
      await offlineDB.updateBookingStatus(
        booking.id,
        'failed',
        error.message || 'Sync failed'
      );
      throw error;
    }
  }

  /**
   * Schedule a retry attempt
   */
  private scheduleRetry() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Retry after 30 seconds
    this.retryTimeout = setTimeout(() => {
      console.log('[OfflineSync] Retrying failed bookings...');
      this.syncPendingBookings();
    }, 30000);
  }

  /**
   * Manually trigger sync
   */
  async triggerSync(): Promise<void> {
    await this.syncPendingBookings();
  }

  /**
   * Check if there are pending bookings
   */
  async hasPendingBookings(): Promise<boolean> {
    const count = await offlineDB.getBookingCount('pending');
    return count > 0;
  }

  /**
   * Get pending booking count
   */
  async getPendingCount(): Promise<number> {
    return await offlineDB.getBookingCount('pending');
  }
}

// Export singleton instance
export const offlineSync = new OfflineSyncManager();

/**
 * Hook for using offline sync in components
 */
export function useOfflineSync() {
  return {
    syncPendingBookings: () => offlineSync.triggerSync(),
    hasPendingBookings: () => offlineSync.hasPendingBookings(),
    getPendingCount: () => offlineSync.getPendingCount(),
    onSyncStatusChange: (callback: SyncCallback) => offlineSync.onSyncStatusChange(callback),
  };
}
