/**
 * Phase 4.4: Performance Optimization
 * Utilities for monitoring and optimizing performance
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
  }

  /**
   * Measure function execution time
   */
  measure(name, fn) {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, true);
      throw error;
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsync(name, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, true);
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  recordMetric(name, duration, error = false) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric = {
      name,
      duration,
      timestamp: Date.now(),
      error,
    };

    this.metrics.get(name).push(metric);

    // Limit metrics to prevent memory issues
    if (this.metrics.get(name).length > 100) {
      this.metrics.get(name).shift();
    }

    if (duration > 100) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(name) {
    const data = this.metrics.get(name) || [];
    if (data.length === 0) {
      return null;
    }

    const durations = data.map((m) => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    const errors = data.filter((m) => m.error).length;

    return {
      count: durations.length,
      average: avg,
      min,
      max,
      total: sum,
      errors,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const result = {};
    this.metrics.forEach((_, name) => {
      const stats = this.getStats(name);
      if (stats) {
        result[name] = stats;
      }
    });
    return result;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Export metrics for analysis
   */
  export() {
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for expensive operations
 */
export const debounce = (fn, wait = 250) => {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), wait);
  };
};

/**
 * Throttle function to limit function calls
 */
export const throttle = (fn, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  window.requestIdleCallback ||
  ((callback) => {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, 1);
  });

/**
 * Cancel idle callback
 */
export const cancelIdleCallback =
  window.cancelIdleCallback ||
  ((id) => {
    clearTimeout(id);
  });

/**
 * Lazy load image with intersection observer
 */
export const lazyLoadImage = (img) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    observer.observe(img);
  } else {
    // Fallback for older browsers
    img.src = img.dataset.src;
  }
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates) => {
  return new Promise((resolve) => {
    requestIdleCallback(() => {
      updates.forEach((update) => update());
      resolve();
    });
  });
};

/**
 * Cache computed values
 */
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  };
};

/**
 * Get Core Web Vitals
 */
export const getWebVitals = () => {
  const vitals = {};

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.FCP = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Ignored
    }

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Ignored
    }
  }

  // Navigation timing
  if ('PerformanceTiming' in window) {
    const timing = performance.timing;
    vitals.TTFB = timing.responseStart - timing.requestStart;
    vitals.DOM_INTERACTIVE = timing.domInteractive - timing.navigationStart;
    vitals.DOM_COMPLETE = timing.domComplete - timing.navigationStart;
    vitals.LOAD_TIME = timing.loadEventEnd - timing.navigationStart;
  }

  return vitals;
};

/**
 * Monitor memory usage (if available)
 */
export const getMemoryInfo = () => {
  if ('memory' in performance) {
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
};

/**
 * Generate performance report
 */
export const generatePerformanceReport = () => {
  return {
    timestamp: new Date().toISOString(),
    metrics: performanceMonitor.getAllMetrics(),
    webVitals: getWebVitals(),
    memory: getMemoryInfo(),
  };
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = () => {
  // Log performance report on page unload
  window.addEventListener('beforeunload', () => {
    const report = generatePerformanceReport();
    console.table(report.metrics);
  });
};
