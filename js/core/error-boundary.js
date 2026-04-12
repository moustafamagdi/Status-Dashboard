/**
 * Phase 3.4: Error Boundaries
 * Wraps critical functions with error handling and recovery
 */

class ErrorBoundary {
  constructor(name = 'Unknown') {
    this.name = name;
    this.errorLog = [];
    this.maxErrors = 50;
  }

  /**
   * Wrap a function with error handling
   */
  wrap(fnName, fn) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.logError(fnName, error, args);
        throw error;
      }
    };
  }

  /**
   * Execute a function with error recovery
   */
  async wrapAsync(fnName, fn) {
    try {
      return await fn();
    } catch (error) {
      this.logError(fnName, error);
      throw error;
    }
  }

  /**
   * Log error with timestamp and context
   */
  logError(fnName, error, args = []) {
    const entry = {
      timestamp: new Date().toISOString(),
      function: fnName,
      boundary: this.name,
      error: error.message,
      stack: error.stack,
      args: args.length > 0 ? JSON.stringify(args).slice(0, 200) : 'none',
    };

    this.errorLog.push(entry);

    // Trim error log if too large
    if (this.errorLog.length > this.maxErrors) {
      this.errorLog = this.errorLog.slice(-this.maxErrors);
    }

    // Log to console
    console.error(`[${this.name}] ${fnName}:`, error);
  }

  /**
   * Get error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Export errors for debugging
   */
  exportErrors() {
    return JSON.stringify(this.errorLog, null, 2);
  }
}

// Create boundary instances for different areas
export const dataBoundary = new ErrorBoundary('DataLayer');
export const uiBoundary = new ErrorBoundary('UILayer');
export const storeBoundary = new ErrorBoundary('StoreLayer');
export const exportBoundary = new ErrorBoundary('ExportLayer');

/**
 * Safe state mutation wrapper
 */
export const safeStateUpdate = (fn) => {
  return dataBoundary.wrap('stateUpdate', fn);
};

/**
 * Safe DOM manipulation wrapper
 */
export const safeDOMUpdate = (fn) => {
  return uiBoundary.wrap('domUpdate', fn);
};

/**
 * Safe export operation wrapper
 */
export const safeExport = (fn) => {
  return exportBoundary.wrap('export', fn);
};

/**
 * Get all errors from all boundaries
 */
export const getAllErrors = () => {
  return [
    ...dataBoundary.getErrorLog(),
    ...uiBoundary.getErrorLog(),
    ...storeBoundary.getErrorLog(),
    ...exportBoundary.getErrorLog(),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

/**
 * Clear all error logs
 */
export const clearAllErrors = () => {
  dataBoundary.clearErrorLog();
  uiBoundary.clearErrorLog();
  storeBoundary.clearErrorLog();
  exportBoundary.clearErrorLog();
};

/**
 * Export all errors for debugging/reporting
 */
export const exportAllErrors = () => {
  return JSON.stringify(getAllErrors(), null, 2);
};

/**
 * Setup global error handling
 */
export const initErrorBoundaries = () => {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    dataBoundary.logError('unhandledRejection', event.reason);
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught Error:', event.error);
    uiBoundary.logError('globalError', event.error);
  });
};

/**
 * Create a safe async wrapper for operations
 */
export const createSafeOperation = (name, operation) => {
  return async (...args) => {
    try {
      return await operation(...args);
    } catch (error) {
      dataBoundary.logError(name, error, args);
      // Re-throw so caller can handle if needed
      throw error;
    }
  };
};
