"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDeviceCapabilities } from "./useDeviceCapabilities";

/**
 * Resource types that can be preloaded
 */
export type PreloadResourceType = "model" | "texture" | "font" | "shader";

/**
 * Priority levels for loading queue
 */
export type PreloadPriority = "critical" | "high" | "medium" | "low";

/**
 * Loading state for individual resources
 */
export type LoadingState = "pending" | "loading" | "loaded" | "error" | "cancelled";

/**
 * Resource item in the preload queue
 */
export interface PreloadResource {
  /** Unique identifier for this resource */
  id: string;
  /** Resource URL to load */
  url: string;
  /** Type of resource */
  type: PreloadResourceType;
  /** Priority in loading queue */
  priority: PreloadPriority;
  /** Current loading state */
  state: LoadingState;
  /** Loading progress (0-1) */
  progress: number;
  /** Error message if failed */
  error?: string;
  /** Loaded data (cached) */
  data?: unknown;
  /** File size in bytes (if known) */
  size?: number;
}

/**
 * Overall preload status
 */
export interface PreloadStatus {
  /** Total number of resources */
  total: number;
  /** Number of loaded resources */
  loaded: number;
  /** Number of failed resources */
  failed: number;
  /** Number of pending resources */
  pending: number;
  /** Number of in-progress resources */
  loading: number;
  /** Overall progress (0-1) */
  progress: number;
  /** Bytes loaded */
  bytesLoaded: number;
  /** Total bytes (if known) */
  bytesTotal: number;
  /** Whether all critical resources are loaded */
  criticalReady: boolean;
}

/**
 * Hook configuration options
 */
export interface UsePreloadOptions {
  /** Maximum concurrent downloads */
  maxConcurrent?: number;
  /** Retry attempts for failed loads */
  retryAttempts?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
  /** Cache TTL in milliseconds (0 = no expiry) */
  cacheTTL?: number;
  /** Maximum cache size in bytes */
  maxCacheSize?: number;
  /** Whether to start loading immediately */
  autoStart?: boolean;
  /** Custom fetch options */
  fetchOptions?: RequestInit;
}

/**
 * Hook return value
 */
export interface UsePreloadReturn {
  /** Current preload status */
  status: PreloadStatus;
  /** All resources in queue */
  resources: PreloadResource[];
  /** Whether preload is active */
  isLoading: boolean;
  /** Start preloading */
  start: () => void;
  /** Pause preloading (completes current downloads) */
  pause: () => void;
  /** Resume preloading */
  resume: () => void;
  /** Cancel all pending loads */
  cancel: () => void;
  /** Cancel a specific resource */
  cancelResource: (id: string) => void;
  /** Retry a failed resource */
  retry: (id: string) => void;
  /** Add resource to queue */
  addResource: (resource: Omit<PreloadResource, "state" | "progress" | "data">) => void;
  /** Remove resource from queue */
  removeResource: (id: string) => void;
  /** Get cached resource data */
  getCached: <T = unknown>(id: string) => T | null;
  /** Clear all cached resources */
  clearCache: () => void;
  /** Get resource by id */
  getResource: (id: string) => PreloadResource | undefined;
}

/**
 * Priority weight for sorting queue (higher = load first)
 */
const PRIORITY_WEIGHT: Record<PreloadPriority, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

/**
 * Config type with all optional fields having defaults
 */
interface PreloadConfig {
  maxConcurrent: number;
  retryAttempts: number;
  retryDelay: number;
  cacheTTL: number;
  maxCacheSize: number;
  autoStart: boolean;
  fetchOptions?: RequestInit;
}

/**
 * Default options based on device capabilities
 */
function getDefaultOptions(deviceCapabilities: {
  isMobile: boolean;
  isLowPerf: boolean;
  deviceMemory: number;
}): PreloadConfig {
  // Reduce concurrent loads on low-performance devices
  const maxConcurrent = deviceCapabilities.isLowPerf
    ? 2
    : deviceCapabilities.isMobile
      ? 3
      : deviceCapabilities.deviceMemory >= 8
        ? 6
        : 4;

  return {
    maxConcurrent,
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 30 * 60 * 1000, // 30 minutes
    maxCacheSize: deviceCapabilities.deviceMemory >= 8 ? 500 * 1024 * 1024 : 100 * 1024 * 1024, // 500MB or 100MB
    autoStart: true,
    fetchOptions: undefined,
  };
}

/**
 * Global cache instance (shared across hook instances)
 */
const globalCache = new Map<string, { data: unknown; timestamp: number; size: number }>();

/**
 * Calculate total cache size
 */
function getCacheSize(): number {
  let size = 0;
  for (const entry of Array.from(globalCache.values())) {
    size += entry.size;
  }
  return size;
}

/**
 * Evict old cache entries if over limit
 */
function evictCache(maxSize: number): void {
  if (getCacheSize() <= maxSize) return;

  // Sort entries by timestamp (oldest first)
  const entries = Array.from(globalCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

  // Evict until under limit
  for (const [key, entry] of entries) {
    if (getCacheSize() <= maxSize * 0.8) break; // Evict to 80% capacity
    globalCache.delete(key);
  }
}

/**
 * Preload resources with priority queue and caching
 */
export function usePreload(options: UsePreloadOptions = {}): UsePreloadReturn {
  const deviceCapabilities = useDeviceCapabilities();
  const defaults = getDefaultOptions(deviceCapabilities);

  const config: PreloadConfig = {
    ...defaults,
    ...options,
  };

  // State
  const [resources, setResources] = useState<Map<string, PreloadResource>>(new Map());
  const [isLoading, setIsLoading] = useState(config.autoStart);
  const [isPaused, setIsPaused] = useState(false);

  // Refs for cancellation
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const loadingQueueRef = useRef<Set<string>>(new Set());

  /**
   * Calculate overall status
   */
  const calculateStatus = useCallback((): PreloadStatus => {
    const resourceList = Array.from(resources.values());

    const total = resourceList.length;
    const loaded = resourceList.filter((r) => r.state === "loaded").length;
    const failed = resourceList.filter((r) => r.state === "error").length;
    const pending = resourceList.filter((r) => r.state === "pending").length;
    const loading = resourceList.filter((r) => r.state === "loading").length;

    const bytesLoaded = resourceList
      .filter((r) => r.state === "loaded")
      .reduce((sum, r) => sum + (r.size || 0), 0);

    const bytesTotal = resourceList
      .reduce((sum, r) => sum + (r.size || 0), 0);

    const progress = total > 0 ? loaded / total : 0;

    const criticalReady = resourceList
      .filter((r) => r.priority === "critical")
      .every((r) => r.state === "loaded");

    return {
      total,
      loaded,
      failed,
      pending,
      loading,
      progress,
      bytesLoaded,
      bytesTotal,
      criticalReady,
    };
  }, [resources]);

  /**
   * Get next resource to load based on priority
   */
  const getNextResource = useCallback((): PreloadResource | null => {
    const pending = Array.from(resources.values())
      .filter((r) => r.state === "pending" || r.state === "error")
      .sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);

    return pending[0] || null;
  }, [resources]);

  /**
   * Load a single resource
   */
  const loadResource = useCallback(async (resource: PreloadResource): Promise<void> => {
    // Check cache first
    const cached = globalCache.get(resource.id);
    if (cached && Date.now() - cached.timestamp < config.cacheTTL) {
      setResources((prev) => {
        const next = new Map(prev);
        next.set(resource.id, {
          ...resource,
          state: "loaded",
          progress: 1,
          data: cached.data,
        });
        return next;
      });
      return;
    }

    // Create abort controller
    const abortController = new AbortController();
    abortControllersRef.current.set(resource.id, abortController);

    try {
      setResources((prev) => {
        const next = new Map(prev);
        next.set(resource.id, { ...resource, state: "loading", progress: 0 });
        return next;
      });

      const response = await fetch(resource.url, {
        ...config.fetchOptions,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get content length for progress tracking
      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      // Read response with progress tracking
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        const progress = total > 0 ? loaded / total : 0.5;

        setResources((prev) => {
          const next = new Map(prev);
          const current = next.get(resource.id);
          if (current && current.state === "loading") {
            next.set(resource.id, { ...current, progress });
          }
          return next;
        });
      }

      // Combine chunks
      const data = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
      }

      // Parse based on type
      let parsedData: unknown;
      switch (resource.type) {
        case "texture":
        case "model":
          // For Three.js, we store the blob URL
          parsedData = URL.createObjectURL(new Blob([data]));
          break;
        case "font":
          // Font data as ArrayBuffer
          parsedData = data.buffer;
          break;
        case "shader":
          // Shaders as text
          parsedData = new TextDecoder().decode(data);
          break;
        default:
          parsedData = data;
      }

      // Update cache
      const size = loaded;
      evictCache(config.maxCacheSize);
      globalCache.set(resource.id, {
        data: parsedData,
        timestamp: Date.now(),
        size,
      });

      setResources((prev) => {
        const next = new Map(prev);
        next.set(resource.id, {
          ...resource,
          state: "loaded",
          progress: 1,
          data: parsedData,
          size,
        });
        return next;
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Cancelled
        setResources((prev) => {
          const next = new Map(prev);
          next.set(resource.id, { ...resource, state: "cancelled", progress: 0 });
          return next;
        });
      } else {
        setResources((prev) => {
          const next = new Map(prev);
          next.set(resource.id, {
            ...resource,
            state: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return next;
        });
      }
    } finally {
      abortControllersRef.current.delete(resource.id);
      loadingQueueRef.current.delete(resource.id);
    }
  }, [config]);

  /**
   * Process loading queue
   */
  const processQueue = useCallback(async (): Promise<void> => {
    if (isPaused || !isLoading) return;

    while (loadingQueueRef.current.size < config.maxConcurrent) {
      const next = getNextResource();
      if (!next) break;

      loadingQueueRef.current.add(next.id);

      // Load in background without awaiting
      loadResource(next).then(() => {
        // Recursively process after each load completes
        processQueue();
      });
    }
  }, [isPaused, isLoading, config.maxConcurrent, getNextResource, loadResource]);

  /**
   * Start preloading
   */
  const start = useCallback((): void => {
    setIsLoading(true);
    setIsPaused(false);
  }, []);

  /**
   * Pause preloading
   */
  const pause = useCallback((): void => {
    setIsPaused(true);
  }, []);

  /**
   * Resume preloading
   */
  const resume = useCallback((): void => {
    setIsPaused(false);
  }, []);

  /**
   * Cancel all pending loads
   */
  const cancel = useCallback((): void => {
    // Abort all active requests
    for (const [id, controller] of Array.from(abortControllersRef.current)) {
      controller.abort();
    }
    abortControllersRef.current.clear();
    loadingQueueRef.current.clear();

    // Mark all pending/loading as cancelled
    setResources((prev) => {
      const next = new Map(prev);
      for (const [id, resource] of Array.from(next)) {
        if (resource.state === "pending" || resource.state === "loading") {
          next.set(id, { ...resource, state: "cancelled", progress: 0 });
        }
      }
      return next;
    });

    setIsLoading(false);
  }, []);

  /**
   * Cancel a specific resource
   */
  const cancelResource = useCallback((id: string): void => {
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
    }

    setResources((prev) => {
      const next = new Map(prev);
      const resource = next.get(id);
      if (resource && (resource.state === "pending" || resource.state === "loading")) {
        next.set(id, { ...resource, state: "cancelled", progress: 0 });
      }
      return next;
    });
  }, []);

  /**
   * Retry a failed resource
   */
  const retry = useCallback((id: string): void => {
    setResources((prev) => {
      const next = new Map(prev);
      const resource = next.get(id);
      if (resource && resource.state === "error") {
        next.set(id, { ...resource, state: "pending", progress: 0, error: undefined });
      }
      return next;
    });
  }, []);

  /**
   * Add resource to queue
   */
  const addResource = useCallback((resource: Omit<PreloadResource, "state" | "progress" | "data">): void => {
    setResources((prev) => {
      const next = new Map(prev);
      next.set(resource.id, {
        ...resource,
        state: "pending",
        progress: 0,
      });
      return next;
    });
  }, []);

  /**
   * Remove resource from queue
   */
  const removeResource = useCallback((id: string): void => {
    // Cancel if loading
    cancelResource(id);

    setResources((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    // Remove from cache
    globalCache.delete(id);
  }, [cancelResource]);

  /**
   * Get cached resource data
   */
  const getCached = useCallback(<T = unknown,>(id: string): T | null => {
    const cached = globalCache.get(id);
    if (!cached) return null;

    // Check TTL
    if (config.cacheTTL > 0 && Date.now() - cached.timestamp > config.cacheTTL) {
      globalCache.delete(id);
      return null;
    }

    return cached.data as T;
  }, [config.cacheTTL]);

  /**
   * Clear all cached resources
   */
  const clearCache = useCallback((): void => {
    // Revoke blob URLs to prevent memory leaks
    for (const entry of Array.from(globalCache.values())) {
      if (typeof entry.data === "string" && entry.data.startsWith("blob:")) {
        URL.revokeObjectURL(entry.data);
      }
    }
    globalCache.clear();
  }, []);

  /**
   * Get resource by id
   */
  const getResource = useCallback((id: string): PreloadResource | undefined => {
    return resources.get(id);
  }, [resources]);

  /**
   * Process queue when state changes
   */
  useEffect(() => {
    if (isLoading && !isPaused) {
      processQueue();
    }
  }, [isLoading, isPaused, resources, processQueue]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel all active requests
      for (const controller of abortControllersRef.current.values()) {
        controller.abort();
      }
    };
  }, []);

  // Convert resources map to array for status calculation
  const resourceList = Array.from(resources.values());
  const status = calculateStatus();

  return {
    status,
    resources: resourceList,
    isLoading: isLoading && !isPaused,
    start,
    pause,
    resume,
    cancel,
    cancelResource,
    retry,
    addResource,
    removeResource,
    getCached,
    clearCache,
    getResource,
  };
}

export default usePreload;
