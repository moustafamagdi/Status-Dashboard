/**
 * Phase 3.5: Loading State Management
 * Provides UI feedback for async operations
 */

class LoadingStateManager {
  constructor() {
    this.activeLoaders = new Map();
    this.defaultConfig = {
      minDuration: 300,
      timeout: 30000,
    };
  }

  /**
   * Start a loading operation
   */
  start(operationId, config = {}) {
    const mergedConfig = { ...this.defaultConfig, ...config };
    this.activeLoaders.set(operationId, {
      id: operationId,
      startTime: Date.now(),
      minDuration: mergedConfig.minDuration,
      timeout: mergedConfig.timeout,
      status: 'running',
      progress: 0,
    });

    this.updateUI();

    // Auto-timeout after specified duration
    if (mergedConfig.timeout > 0) {
      setTimeout(() => {
        if (this.activeLoaders.has(operationId)) {
          this.fail(operationId, 'Operation timeout');
        }
      }, mergedConfig.timeout);
    }
  }

  /**
   * Update loading progress
   */
  updateProgress(operationId, progress) {
    const loader = this.activeLoaders.get(operationId);
    if (loader) {
      loader.progress = Math.min(100, Math.max(0, progress));
      this.updateUI();
    }
  }

  /**
   * Complete a loading operation
   */
  end(operationId) {
    const loader = this.activeLoaders.get(operationId);
    if (loader) {
      const elapsed = Date.now() - loader.startTime;
      const remaining = Math.max(0, loader.minDuration - elapsed);

      // Wait minimum duration before showing completion
      if (remaining > 0) {
        setTimeout(() => {
          this.activeLoaders.delete(operationId);
          this.updateUI();
        }, remaining);
      } else {
        this.activeLoaders.delete(operationId);
        this.updateUI();
      }
    }
  }

  /**
   * Mark operation as failed
   */
  fail(operationId, error) {
    const loader = this.activeLoaders.get(operationId);
    if (loader) {
      loader.status = 'error';
      loader.error = error;
      console.error(`Loading operation ${operationId} failed:`, error);

      // Auto-remove after showing error briefly
      setTimeout(() => {
        this.activeLoaders.delete(operationId);
        this.updateUI();
      }, 2000);
    }
  }

  /**
   * Check if any operation is loading
   */
  isLoading() {
    return this.activeLoaders.size > 0;
  }

  /**
   * Get all active loaders
   */
  getActiveLoaders() {
    return Array.from(this.activeLoaders.values());
  }

  /**
   * Update UI based on loading state
   */
  updateUI() {
    const isLoading = this.isLoading();
    const loaders = this.getActiveLoaders();

    // Update global loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar && loaders.length > 0) {
      const avgProgress = loaders.reduce((sum, l) => sum + l.progress, 0) / loaders.length;
      progressBar.style.width = `${avgProgress}%`;
    }

    // Update loading text
    const loadingText = document.getElementById('loading-text');
    if (loadingText && loaders.length > 0) {
      const loader = loaders[0];
      loadingText.textContent = loader.status === 'error' ? loader.error : 'Loading...';
    }
  }

  /**
   * Clear all loading states
   */
  clearAll() {
    this.activeLoaders.clear();
    this.updateUI();
  }
}

export const loadingManager = new LoadingStateManager();

/**
 * Wrap async function with loading state management
 */
export const withLoadingState = (operationId, fn, config = {}) => {
  return async (...args) => {
    loadingManager.start(operationId, config);
    try {
      const result = await fn(...args);
      loadingManager.end(operationId);
      return result;
    } catch (error) {
      loadingManager.fail(operationId, error.message || String(error));
      throw error;
    }
  };
};

/**
 * Promise-based loading wrapper
 */
export const withLoading = (operationId, promise, config = {}) => {
  loadingManager.start(operationId, config);
  return promise
    .then((result) => {
      loadingManager.end(operationId);
      return result;
    })
    .catch((error) => {
      loadingManager.fail(operationId, error.message || String(error));
      throw error;
    });
};

/**
 * Create a loading boundary that shows during operation
 */
export const createLoadingBoundary = (operationId, initialMessage = 'Loading...') => {
  return {
    start: (message = initialMessage) => {
      loadingManager.start(operationId, { minDuration: 300 });
      const loadingText = document.getElementById('loading-text');
      if (loadingText) {
        loadingText.textContent = message;
      }
    },
    progress: (value) => loadingManager.updateProgress(operationId, value),
    end: () => loadingManager.end(operationId),
    fail: (error) => loadingManager.fail(operationId, error),
  };
};

/**
 * Initialize loading state DOM if not present
 */
export const initLoadingStateUI = () => {
  if (!document.getElementById('loading-indicator')) {
    const indicator = document.createElement('div');
    indicator.id = 'loading-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      display: none;
      flex-direction: column;
      gap: 8px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 200px;
    `;

    indicator.innerHTML = `
      <div id="loading-text" style="font-size:11px;font-weight:600;color:var(--text);">Loading...</div>
      <div id="progress-bar" style="
        height: 3px;
        background: var(--border);
        border-radius: 2px;
        overflow: hidden;
        width: 100%;
      ">
        <div style="
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--blue));
          width: 0%;
          transition: width 0.3s ease;
        "></div>
      </div>
    `;

    document.body.appendChild(indicator);
  }
};
