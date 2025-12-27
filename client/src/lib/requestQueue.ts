// Request queue for offline support

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = "smartpro_request_queue";
const MAX_RETRIES = 3;

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load request queue:", error);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to save request queue:", error);
    }
  }

  private setupOnlineListener() {
    window.addEventListener("online", () => {
      console.log("Connection restored, processing queued requests...");
      this.processQueue();
    });
  }

  add(request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedRequest);
    this.saveQueue();
    console.log("Request queued:", queuedRequest.id);

    // Try to process immediately if online
    if (navigator.onLine && !this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.processing = true;
    const failedRequests: QueuedRequest[] = [];

    for (const request of this.queue) {
      try {
        console.log("Processing queued request:", request.id);
        
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            "Content-Type": "application/json",
            ...request.headers,
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log("Request processed successfully:", request.id);
      } catch (error) {
        console.error("Failed to process request:", request.id, error);
        
        // Retry logic
        if (request.retryCount < MAX_RETRIES) {
          failedRequests.push({
            ...request,
            retryCount: request.retryCount + 1,
          });
        } else {
          console.error("Max retries reached for request:", request.id);
        }
      }
    }

    this.queue = failedRequests;
    this.saveQueue();
    this.processing = false;

    console.log(`Queue processing complete. ${this.queue.length} requests remaining.`);
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();

// Helper function to queue a request
export function queueRequest(
  url: string,
  method: string = "POST",
  body?: any,
  headers?: Record<string, string>
) {
  requestQueue.add({ url, method, body, headers });
}
