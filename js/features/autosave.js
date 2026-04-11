const DEFAULT_DEBOUNCE_MS = 400;

export class Autosave {
  constructor(store, options = {}) {
    if (!store || typeof store.subscribe !== 'function' || typeof store.getState !== 'function') {
      throw new TypeError('Autosave requires a valid store instance.');
    }

    this.store = store;
    this.key = options.key ?? 'shd_autosave_state';
    this.debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.storage = options.storage ?? window.localStorage;
    this.onStatusChange = options.onStatusChange ?? (() => {});

    this.timer = null;
    this.unsubscribe = null;
    this.lastSerialized = '';
  }

  start() {
    if (this.unsubscribe) {
      return;
    }

    this.lastSerialized = this.#safeSerialize(this.store.getState());

    this.unsubscribe = this.store.subscribe((state) => {
      const serialized = this.#safeSerialize(state);
      if (serialized === this.lastSerialized) {
        return;
      }

      this.lastSerialized = serialized;
      this.#scheduleSave(serialized);
    });
  }

  stop() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.#clearTimer();
  }

  load() {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed ? parsed : null;
    } catch (error) {
      this.#setStatus('Error', error);
      return null;
    }
  }

  saveNow() {
    const serialized = this.#safeSerialize(this.store.getState());
    this.#clearTimer();
    this.#persist(serialized);
  }

  #scheduleSave(serialized) {
    this.#setStatus('Saving...');
    this.#clearTimer();

    this.timer = setTimeout(() => {
      this.#persist(serialized);
    }, this.debounceMs);
  }

  #persist(serialized) {
    try {
      this.storage.setItem(this.key, serialized);
      this.#setStatus('Saved');
    } catch (error) {
      this.#setStatus('Error', error);
    }
  }

  #setStatus(label, error = null) {
    this.onStatusChange({
      label,
      error,
    });
  }

  #clearTimer() {
    if (!this.timer) {
      return;
    }

    clearTimeout(this.timer);
    this.timer = null;
  }

  #safeSerialize(state) {
    try {
      return JSON.stringify(state ?? {});
    } catch {
      return '{}';
    }
  }
}

export const createAutosave = (store, options) => new Autosave(store, options);
