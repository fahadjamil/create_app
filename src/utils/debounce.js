import { useCallback, useRef } from 'react';

/**
 * Debounce function to limit the rate of function execution
 */
export function debounce(func, delay) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * React hook version of debounce
 */
export function useDebounce(func, wait) {
  const timeout = useRef(null);

  return useCallback((...args) => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      func(...args);
    }, wait);
  }, [func, wait]);
}

/**
 * Throttle function to limit function execution to once per interval
 */
export function throttle(func, interval) {
  let lastCallTime = 0;
  let timeoutId = null;

  return (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= interval) {
      lastCallTime = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutId = null;
        func(...args);
      }, interval - timeSinceLastCall);
    }
  };
}

/**
 * Request deduplication utility
 */
export class RequestDeduplicator {
  static pendingRequests = new Map();

  static async deduplicate(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  static clear(key) {
    if (key) {
      this.pendingRequests.delete(key);
    } else {
      this.pendingRequests.clear();
    }
  }
}
