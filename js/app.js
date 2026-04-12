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

const debounce = (fn, wait = 250) => {
  let timer = null;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), wait);
  };
};

const initStaticEventBindings = () => {
  bindClick('btn-undo', () => window.undo?.());
  bindClick('btn-redo', () => window.redo?.());
  bindClick('manual-save-btn', () => window.manualSave?.());
  bindClick('autosave-btn', () => window.toggleAutoSave?.());
  // theme-toggle binding moved to window.load after theme module init
  bindClick('btn-open-versions', () => window.openVersionsModal?.());
  bindClick('btn-open-share', () => window.openShareModal?.());
  bindClick('btn-export-json', () => window.exportJSON?.());
  bindClick('btn-import-json', () => document.getElementById('import-file')?.click());
  bindClick('btn-export-pdf', () => window.exportPDF?.());
  bindClick('btn-consume-shared', () => window.consumeSharedVersion?.());
  bindClick('btn-exit-readonly', () => window.exitReadonly?.());
  bindClick('tab-btn-editor', () => window.switchTab?.('editor'));
  bindClick('tab-btn-code', () => window.switchTab?.('code'));
  bindClick('btn-add-section', () => window.openAddSectionModal?.());
  bindClick('btn-download-svg', () => window.downloadSVG?.());
  bindClick('btn-refresh-svg', () => window.generateSVG?.());
  bindClick('btn-cancel-add-section', () => window.closeModal?.('modal-overlay'));
  bindClick('btn-confirm-add-section', () => window.confirmAddSection?.());
  bindClick('btn-save-version', () => window.saveVersion?.());
  bindClick('btn-close-versions-modal', () => window.closeModal?.('versions-modal'));
  bindClick('btn-copy-share-url', () => window.copyShareURL?.());
  bindClick('btn-close-share-modal', () => window.closeModal?.('share-modal'));

  const importFile = document.getElementById('import-file');
  importFile?.addEventListener('change', (event) => window.importJSON?.(event));

  const debouncedGenerateSvg = debounce(() => {
    window.markDirty?.();
    window.generateSVG?.();
  }, 200);

  bindInput('proj-title', debouncedGenerateSvg);
  bindInput('proj-date', debouncedGenerateSvg);

  const debouncedAutoCalc = debounce(() => {
    window.markDirty?.();
    window.autoCalc?.();
  }, 150);

  bindInput('val-approved', debouncedAutoCalc);
  bindInput('val-ur', debouncedAutoCalc);

  bindKeydown('val-approved', (event) => window.preventScroll?.(event));
  bindKeydown('val-ur', (event) => window.preventScroll?.(event));
};

const enforceNumericBoundaries = () => {
  const approvedInput = document.getElementById('val-approved');
  const underReviewInput = document.getElementById('val-ur');
  const newSectionCountInput = document.getElementById('new-sec-count');

  const coerceMinZero = (node) => {
    if (!node) return;
    const value = Number(node.value);
    if (!Number.isFinite(value) || value < 0) {
      node.value = '0';
    }
  };

  [approvedInput, underReviewInput, newSectionCountInput].forEach((node) => {
    if (!node) return;
    node.addEventListener('blur', () => coerceMinZero(node));
  });

  approvedInput?.addEventListener('input', () => {
    coerceMinZero(approvedInput);
  });
  underReviewInput?.addEventListener('input', () => coerceMinZero(underReviewInput));
  newSectionCountInput?.addEventListener('input', () => coerceMinZero(newSectionCountInput));
};

const setupSectionsEmptyState = () => {
  const container = document.getElementById('sections-container');
  const emptyState = document.getElementById('sections-empty-state');
  if (!container || !emptyState) {
    return;
  }

  const update = () => {
    emptyState.hidden = container.children.length > 0;
  };

  const observer = new MutationObserver(update);
  observer.observe(container, { childList: true });
  update();
};

const setupDeleteConfirmations = () => {
  const wrapWithConfirmation = (fnName, message) => {
    const original = window[fnName];
    if (typeof original !== 'function') {
      return;
    }

    window[fnName] = (...args) => {
      if (!window.confirm(message)) {
        return;
      }
      return original(...args);
    };
  };

  wrapWithConfirmation('removeSec', 'Delete this section?');
  wrapWithConfirmation('removeItem', 'Delete this item?');
  wrapWithConfirmation('deleteVersion', 'Delete this saved version?');
};

const setupKeyboardShortcuts = () => {
  document.addEventListener('keydown', (event) => {
    const isModifier = event.ctrlKey || event.metaKey;

    if (isModifier && event.key.toLowerCase() === 's') {
      event.preventDefault();
      window.manualSave?.();
      return;
    }

    if (isModifier && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        window.redo?.();
      } else {
        window.undo?.();
      }
      return;
    }

    if (event.key === 'Enter') {
      const overlay = document.getElementById('modal-overlay');
      const newSectionName = document.getElementById('new-sec-name');
      if (overlay && overlay.classList.contains('open') && document.activeElement === newSectionName) {
        event.preventDefault();
        window.confirmAddSection?.();
      }
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      initStaticEventBindings();
      enforceNumericBoundaries();
      setupSectionsEmptyState();
      setupDeleteConfirmations();
      setupKeyboardShortcuts();
    },
    { once: true },
  );
} else {
  initStaticEventBindings();
  enforceNumericBoundaries();
  setupSectionsEmptyState();
  setupDeleteConfirmations();
  setupKeyboardShortcuts();
}
