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

const initStaticEventBindings = () => {
  bindClick('btn-undo', () => window.undo?.());
  bindClick('btn-redo', () => window.redo?.());
  bindClick('manual-save-btn', () => window.manualSave?.());
  bindClick('autosave-btn', () => window.toggleAutoSave?.());
  bindClick('theme-toggle', () => window.toggleTheme?.());
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

  bindInput('proj-title', () => {
    window.markDirty?.();
    window.generateSVG?.();
  });

  bindInput('proj-date', () => {
    window.markDirty?.();
    window.generateSVG?.();
  });

  const onPrimaryInput = () => {
    window.markDirty?.();
    window.autoCalc?.();
  };

  bindInput('val-total', onPrimaryInput);
  bindInput('val-approved', onPrimaryInput);
  bindInput('val-ur', onPrimaryInput);

  bindKeydown('val-total', (event) => window.preventScroll?.(event));
  bindKeydown('val-approved', (event) => window.preventScroll?.(event));
  bindKeydown('val-ur', (event) => window.preventScroll?.(event));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStaticEventBindings, { once: true });
} else {
  initStaticEventBindings();
}
