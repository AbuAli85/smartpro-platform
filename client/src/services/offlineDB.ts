/**
 * IndexedDB Service for Offline Data Storage
 * Manages offline booking queue and automatic synchronization
 */

const DB_NAME = 'SmartProOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineBookings';

export interface OfflineBooking {
  id: string;
  officeId: number;
  serviceName: string;
  date: string;
  time: string;
  formData: Record<string, any>;
  usePoints: boolean;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error?: string;
  retryCount: number;
}

class OfflineDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OfflineDB] Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for offline bookings
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('[OfflineDB] Object store created');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Add a booking to the offline queue
   */
  async addBooking(booking: Omit<OfflineBooking, 'id' | 'createdAt' | 'status' | 'retryCount'>): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineBooking: OfflineBooking = {
      ...booking,
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(offlineBooking);

      request.onsuccess = () => {
        console.log('[OfflineDB] Booking added to offline queue:', id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('[OfflineDB] Failed to add booking:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all pending bookings
   */
  async getPendingBookings(): Promise<OfflineBooking[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[OfflineDB] Failed to get pending bookings:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all bookings (for display purposes)
   */
  async getAllBookings(): Promise<OfflineBooking[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('[OfflineDB] Failed to get all bookings:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: string,
    status: OfflineBooking['status'],
    error?: string
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const booking = getRequest.result;
        if (!booking) {
          reject(new Error('Booking not found'));
          return;
        }

        booking.status = status;
        if (error) booking.error = error;
        if (status === 'failed') booking.retryCount++;

        const updateRequest = store.put(booking);

        updateRequest.onsuccess = () => {
          console.log('[OfflineDB] Booking status updated:', id, status);
          resolve();
        };

        updateRequest.onerror = () => {
          console.error('[OfflineDB] Failed to update booking:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('[OfflineDB] Failed to get booking:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  /**
   * Delete a booking
   */
  async deleteBooking(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[OfflineDB] Booking deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('[OfflineDB] Failed to delete booking:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all synced bookings
   */
  async clearSyncedBookings(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const bookings = await this.getAllBookings();
    const syncedBookings = bookings.filter((b) => b.status === 'synced');

    for (const booking of syncedBookings) {
      await this.deleteBooking(booking.id);
    }

    console.log('[OfflineDB] Cleared', syncedBookings.length, 'synced bookings');
  }

  /**
   * Get booking count by status
   */
  async getBookingCount(status?: OfflineBooking['status']): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      if (status) {
        const index = store.index('status');
        const request = index.count(status);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('[OfflineDB] Failed to count bookings:', request.error);
          reject(request.error);
        };
      } else {
        const request = store.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error('[OfflineDB] Failed to count bookings:', request.error);
          reject(request.error);
        };
      }
    });
  }
}

// Export singleton instance
export const offlineDB = new OfflineDBService();
