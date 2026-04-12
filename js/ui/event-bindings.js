/**
 * Phase 3.3: Event binding orchestration
 * Centralizes all DOM event listeners with error boundaries
 */

const bindClick = (id, handler) => {
  const node = document.getElementById(id);
  if (!node || typeof handler !== 'function') {
    return;
  }
  node.addEventListener('click', handler);
};

const bindInput = (id, handler) => {
  const node = document.getElementById(id);
  if (!node || typeof handler !== 'function') {
    return;
  }
  node.addEventListener('input', handler);
};

const bindKeydown = (id, handler) => {
  const node = document.getElementById(id);
  if (!node || typeof handler !== 'function') {
    return;
  }
  node.addEventListener('keydown', handler);
};

const bindChange = (id, handler) => {
  const node = document.getElementById(id);
  if (!node || typeof handler !== 'function') {
    return;
  }
  node.addEventListener('change', handler);
};

const debounce = (fn, wait = 250) => {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), wait);
  };
};

/**
 * Error boundary wrapper for safe execution
 */
const safeCall = (fnName, fn) => {
  try {
    return fn?.();
  } catch (error) {
    console.error(`Error in ${fnName}:`, error);
    return undefined;
  }
};

/**
 * Initialize all static event bindings
 * All event handlers reference window.* functions which must be available
 */
export const initEventBindings = () => {
  // Control buttons
  bindClick('btn-undo', () => safeCall('undo', () => window.undo?.()));
  bindClick('btn-redo', () => safeCall('redo', () => window.redo?.()));
  bindClick('manual-save-btn', () => safeCall('manualSave', () => window.manualSave?.()));
  bindClick('autosave-btn', () => safeCall('toggleAutoSave', () => window.toggleAutoSave?.()));
  bindClick('theme-toggle', () => safeCall('toggleTheme', () => window.toggleTheme?.()));

  // Version and sharing
  bindClick('btn-open-versions', () =>
    safeCall('openVersionsModal', () => window.openVersionsModal?.()),
  );
  bindClick('btn-open-share', () => safeCall('openShareModal', () => window.openShareModal?.()));
  bindClick('btn-export-json', () => safeCall('exportJSON', () => window.exportJSON?.()));
  bindClick('btn-import-json', () =>
    safeCall('importFileClick', () => document.getElementById('import-file')?.click()),
  );
  bindClick('btn-export-pdf', () => safeCall('exportPDF', () => window.exportPDF?.()));
  bindClick('btn-consume-shared', () =>
    safeCall('consumeSharedVersion', () => window.consumeSharedVersion?.()),
  );
  bindClick('btn-exit-readonly', () =>
    safeCall('exitReadonly', () => window.exitReadonly?.()),
  );

  // Tab switching
  bindClick('tab-btn-editor', () =>
    safeCall('switchTabEditor', () => window.switchTab?.('editor')),
  );
  bindClick('tab-btn-code', () => safeCall('switchTabCode', () => window.switchTab?.('code')));

  // Section and item management
  bindClick('btn-add-section', () =>
    safeCall('openAddSectionModal', () => window.openAddSectionModal?.()),
  );
  bindClick('btn-download-svg', () =>
    safeCall('downloadSVG', () => window.downloadSVG?.()),
  );
  bindClick('btn-refresh-svg', () =>
    safeCall('generateSVG', () => window.generateSVG?.()),
  );

  // Modal controls
  bindClick('btn-cancel-add-section', () =>
    safeCall('closeAddModal', () => window.closeModal?.('modal-overlay')),
  );
  bindClick('btn-confirm-add-section', () =>
    safeCall('confirmAddSection', () => window.confirmAddSection?.()),
  );
  bindClick('btn-save-version', () =>
    safeCall('saveVersion', () => window.saveVersion?.()),
  );
  bindClick('btn-close-versions-modal', () =>
    safeCall('closeVersionsModal', () => window.closeModal?.('versions-modal')),
  );
  bindClick('btn-copy-share-url', () =>
    safeCall('copyShareURL', () => window.copyShareURL?.()),
  );
  bindClick('btn-close-share-modal', () =>
    safeCall('closeShareModal', () => window.closeModal?.('share-modal')),
  );

  // File import
  const importFile = document.getElementById('import-file');
  if (importFile) {
    importFile.addEventListener('change', (event) =>
      safeCall('importJSON', () => window.importJSON?.(event)),
    );
  }

  // Input bindings with debouncing
  const debouncedGenerateSvg = debounce(() => {
    safeCall('markDirty', () => window.markDirty?.());
    safeCall('generateSVG', () => window.generateSVG?.());
  }, 200);

  bindInput('proj-title', debouncedGenerateSvg);
  bindInput('proj-date', debouncedGenerateSvg);

  const debouncedAutoCalc = debounce(() => {
    safeCall('autoCalc', () => window.autoCalc?.());
    safeCall('markDirty', () => window.markDirty?.());
  }, 150);

  bindInput('val-approved', debouncedAutoCalc);
  bindInput('val-ur', debouncedAutoCalc);

  // Prevent scroll on number inputs
  bindKeydown('val-approved', (event) =>
    safeCall('preventScroll', () => window.preventScroll?.(event)),
  );
  bindKeydown('val-ur', (event) =>
    safeCall('preventScroll', () => window.preventScroll?.(event)),
  );
};

/**
 * Enforce numeric boundaries on specific inputs
 */
export const enforceNumericBoundaries = () => {
  const approvedInput = document.getElementById('val-approved');
  const underReviewInput = document.getElementById('val-ur');
  const newSectionCountInput = document.getElementById('new-sec-count');

  const coerceMinZero = (node) => {
    if (!node) {
      return;
    }
    const value = Number(node.value);
    if (!Number.isFinite(value) || value < 0) {
      node.value = '0';
    }
  };

  [approvedInput, underReviewInput, newSectionCountInput].forEach((node) => {
    if (!node) {
      return;
    }
    coerceMinZero(node);
  });
};

/**
 * Initialize event bindings on DOM ready
 * Called from inline script after globalController is available
 */
export const initDOMEventBindings = () => {
  try {
    initEventBindings();
    enforceNumericBoundaries();
  } catch (error) {
    console.error('Failed to initialize DOM event bindings:', error);
  }
};
