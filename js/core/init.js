import { Store, createStore } from '../state/store.js';
import { Autosave, createAutosave } from '../features/autosave.js';
import { Validator, createValidator } from './validator.js';
import { Calculator, createCalculator } from './calculator.js';
import { DataExport, createDataExport } from '../features/export.js';
import { UndoManager } from './undo-manager.js';

/**
 * Master initialization module that wires all components together.
 * Exports a single controller object with public methods.
 */

let store = null;
let autosave = null;
let validator = null;
let calculator = null;
let undoManager = null;
let dataExport = null;

/**
 * Initialize all components and return a controller object
 */
export function initialize(initialState = {}, options = {}) {
  // Create core instances
  calculator = createCalculator();
  store = createStore(initialState);
  validator = createValidator(calculator);
  undoManager = new UndoManager(store, { debounceMs: 400, maxSnapshots: 50 });
  dataExport = createDataExport({ version: 1 });

  const autosaveOptions = {
    key: options.autosaveKey ?? 'shd_v4',
    debounceMs: options.autosaveDebounceMs ?? 1500,
    storage: options.storage ?? window.localStorage,
    onStatusChange: options.onAutosaveStatus ?? (() => {}),
  };

  autosave = createAutosave(store, autosaveOptions);
  undoManager.start();
  autosave.start();

  // Validate initial state
  const validationResult = validator.validate(store.getState());

  return createController({
    store,
    autosave,
    validator,
    calculator,
    undoManager,
    dataExport,
    validationResult,
  });
}

/**
 * Create the public controller object with methods for the inline script
 */
function createController({ store, autosave, validator, calculator, undoManager, dataExport, validationResult }) {
  return {
    // Store access
    getState: () => store.getState(),
    setState: (partialState) => store.setState(partialState),
    subscribeToState: (listener) => store.subscribe(listener),

    // Validation
    validate: (state) => validator.validate(state),
    getValidationErrors: () => validationResult.errors,
    isValid: () => validationResult.isValid,

    // Autosave
    startAutosave: () => autosave.start(),
    stopAutosave: () => autosave.stop(),
    saveNow: () => autosave.saveNow(),
    loadSavedState: () => autosave.load(),

    // Undo / Redo
    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),
    canUndo: () => undoManager.canUndo(),
    canRedo: () => undoManager.canRedo(),
    clearUndoHistory: () => undoManager.clear(),

    // Export / Import
    exportToJSON: (state) => dataExport.toJSON(state),
    downloadJSON: (filename, state) => dataExport.download(filename, state),
    importFromJSON: (jsonText) => dataExport.fromJSON(jsonText),

    // Utility
    getCalculator: () => calculator,
    getStore: () => store,
    getValidator: () => validator,
  };
}

/**
 * Get the current controller instance (for reuse)
 */
export function getController() {
  if (!store) {
    throw new Error('Controller not initialized. Call initialize() first.');
  }

  return createController({
    store,
    autosave,
    validator,
    calculator,
    undoManager,
    dataExport,
  });
}

/**
 * Stop all services (cleanup)
 */
export function shutdown() {
  if (undoManager) undoManager.stop();
  if (autosave) autosave.stop();
}
