// Performance monitoring utilities

export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  // Start timing an operation
  static start(label: string) {
    this.marks.set(label, performance.now());
  }

  // End timing and log the duration
  static end(label: string) {
    const startTime = this.marks.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      this.marks.delete(label);
      return duration;
    }
    return null;
  }

  // Measure a function execution time
  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  // Log Web Vitals
  static logWebVitals() {
    if (typeof window === "undefined") return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log("[Web Vitals] LCP:", entry);
      }
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log("[Web Vitals] FID:", entry);
      }
    }).observe({ entryTypes: ["first-input"] });

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
        }
      }
      console.log("[Web Vitals] CLS:", clsScore);
    }).observe({ entryTypes: ["layout-shift"] });
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
export function lazyLoadImage(img: HTMLImageElement) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        const src = target.dataset.src;
        if (src) {
          target.src = src;
          target.removeAttribute("data-src");
        }
        observer.unobserve(target);
      }
    });
  });

  observer.observe(img);
}

// Memoize function results
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Get connection speed
export function getConnectionSpeed(): string {
  if (typeof navigator === "undefined" || !(navigator as any).connection) {
    return "unknown";
  }
  const connection = (navigator as any).connection;
  return connection.effectiveType || "unknown";
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const memory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  
  // Consider low-end if less than 4GB RAM or less than 4 cores
  return (memory && memory < 4) || (cores && cores < 4);
}
