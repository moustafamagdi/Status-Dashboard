/**
 * UndoManager — Drives undo/redo entirely from Store changes.
 * Debounces snapshots to avoid excessive memory usage.
 * Limit snapshots to avoid bloating memory.
 */
export class UndoManager {
  constructor(store, options = {}) {
    if (!store || typeof store.subscribe !== 'function' || typeof store.getState !== 'function') {
      throw new TypeError('UndoManager requires a valid store instance.');
    }

    this.store = store;
    this.debounceMs = options.debounceMs ?? 400;
    this.maxSnapshots = options.maxSnapshots ?? 50;

    this.undoStack = [];
    this.redoStack = [];
    this.unsubscribe = null;
    this.debounceTimer = null;
    this.lastSnapshot = '';
  }

  start() {
    if (this.unsubscribe) {
      return;
    }

    // Take initial snapshot
    this.lastSnapshot = this.#serialize(this.store.getState());
    this.undoStack = [this.lastSnapshot];

    this.unsubscribe = this.store.subscribe((state) => {
      const serialized = this.#serialize(state);

      // Ignore if state hasn't changed (prevents duplicate snapshots)
      if (serialized === this.lastSnapshot) {
        return;
      }

      this.lastSnapshot = serialized;
      this.#scheduleSnapshot(serialized);
    });
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.#clearTimer();
  }

  undo() {
    if (this.undoStack.length < 2) {
      return false;
    }

    const current = this.undoStack.pop();
    this.redoStack.push(current);

    const previous = this.undoStack[this.undoStack.length - 1];
    this.#restoreSnapshot(previous);

    return true;
  }

  redo() {
    if (this.redoStack.length === 0) {
      return false;
    }

    const next = this.redoStack.pop();
    this.undoStack.push(next);
    this.#restoreSnapshot(next);

    return true;
  }

  canUndo() {
    return this.undoStack.length >= 2;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [this.lastSnapshot];
    this.redoStack = [];
  }

  #scheduleSnapshot(serialized) {
    this.#clearTimer();

    this.debounceTimer = setTimeout(() => {
      // Only add if different from last
      if (this.undoStack[this.undoStack.length - 1] !== serialized) {
        this.undoStack.push(serialized);

        // Trim if exceeds max
        if (this.undoStack.length > this.maxSnapshots) {
          this.undoStack = this.undoStack.slice(-this.maxSnapshots);
        }

        // Clear redo stack on new action
        this.redoStack = [];
      }
    }, this.debounceMs);
  }

  #restoreSnapshot(snapshot) {
    try {
      const state = JSON.parse(snapshot);
      this.store.setState(state);
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
    }
  }

  #serialize(state) {
    try {
      return JSON.stringify(state ?? {});
    } catch {
      return '{}';
    }
  }

  #clearTimer() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}
