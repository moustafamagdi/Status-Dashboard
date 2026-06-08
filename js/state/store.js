const DEFAULT_STATE = Object.freeze({
  contractorName: '',
  title: '',
  date: '',
  total: 0,
  approved: 0,
  underReview: 0,
  sections: [],
  selectedColor: 'red',
  isReadonly: false,
});

export class Store {
  constructor(initialState = {}) {
    this.state = this.#normalizeState({ ...DEFAULT_STATE, ...initialState });
    this.listeners = new Set();
  }

  getState() {
    return this.#cloneState(this.state);
  }

  setState(partialState = {}) {
    const nextState = this.#normalizeState({
      ...this.state,
      ...partialState,
    });

    if (this.#isEqualState(this.state, nextState)) {
      return this.getState();
    }

    this.state = nextState;
    this.#notify();
    return this.getState();
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Store subscriber must be a function.');
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  #notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  #normalizeState(candidate) {
    return {
      title: this.#toSafeString(candidate.title),
      contractorName: this.#toSafeString(candidate.contractorName),
      date: this.#toSafeString(candidate.date),
      total: this.#toSafeNumber(candidate.total),
      approved: this.#toSafeNumber(candidate.approved),
      underReview: this.#toSafeNumber(candidate.underReview),
      sections: Array.isArray(candidate.sections)
        ? [...candidate.sections]
        : candidate.sections ?? [],
      selectedColor: this.#toSafeString(candidate.selectedColor || 'red'),
      isReadonly: Boolean(candidate.isReadonly),
    };
  }

  #toSafeNumber(value) {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
  }

  #toSafeString(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value);
  }

  #cloneState(source) {
    return {
      ...source,
      sections: [...source.sections],
    };
  }

  #isEqualState(left, right) {
    return (
      left.title === right.title &&
      left.contractorName === right.contractorName &&
      left.date === right.date &&
      left.total === right.total &&
      left.approved === right.approved &&
      left.underReview === right.underReview &&
      left.selectedColor === right.selectedColor &&
      left.isReadonly === right.isReadonly &&
      left.sections.length === right.sections.length &&
      left.sections.every((item, index) => item === right.sections[index])
    );
  }
}

export const createStore = (initialState) => new Store(initialState);
