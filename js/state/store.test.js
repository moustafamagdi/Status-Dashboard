import { createStore } from './store.js';

describe('Store', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      total: 100,
      approved: 60,
      underReview: 20,
      sections: [],
    });
  });

  describe('getState()', () => {
    it('should return current state', () => {
      const state = store.getState();
      expect(state.total).toBe(100);
      expect(state.approved).toBe(60);
    });

    it('should return immutable copy', () => {
      const state1 = store.getState();
      state1.total = 999;
      const state2 = store.getState();
      expect(state2.total).toBe(100);
    });
  });

  describe('setState()', () => {
    it('should merge partial state updates', () => {
      store.setState({ approved: 70 });
      const state = store.getState();
      expect(state.approved).toBe(70);
      expect(state.total).toBe(100);
    });

    it('should trigger subscribers on state change', () => {
      const subscriber = jest.fn();
      store.subscribe(subscriber);
      store.setState({ approved: 75 });
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith({
        contractorName: '',
        title: '',
        date: '',
        total: 100,
        approved: 75,
        underReview: 20,
        sections: [],
        selectedColor: 'red',
        isReadonly: false,
      });
    });

    it('should not trigger subscribers if state unchanged', () => {
      const subscriber = jest.fn();
      store.subscribe(subscriber);
      store.setState({ approved: 60 });
      expect(subscriber).toHaveBeenCalledTimes(0);
    });

    it('should handle nested state updates', () => {
      const initialState = {
        total: 100,
        approved: 60,
        underReview: 20,
        sections: [{ id: 'sec1', name: 'Section 1', items: [] }],
      };
      store = createStore(initialState);
      store.setState({
        sections: [{ id: 'sec1', name: 'Section 1', items: [{ count: 5 }] }],
      });
      const state = store.getState();
      expect(state.sections[0].items).toHaveLength(1);
    });

    it('should preserve text fields when updating numeric fields', () => {
      store = createStore({
        contractorName: 'Virtual Projects Ltd',
        title: 'My Project',
        date: 'April 2026',
        total: 100,
        approved: 60,
        underReview: 20,
        sections: [],
      });

      store.setState({ approved: 70 });
      const state = store.getState();

      expect(state.contractorName).toBe('Virtual Projects Ltd');
      expect(state.title).toBe('My Project');
      expect(state.date).toBe('April 2026');
    });
  });

  describe('subscribe()', () => {
    it('should return unsubscribe function', () => {
      const subscriber = jest.fn();
      const unsubscribe = store.subscribe(subscriber);
      expect(typeof unsubscribe).toBe('function');

      store.setState({ approved: 80 });
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.setState({ approved: 85 });
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers', () => {
      const sub1 = jest.fn();
      const sub2 = jest.fn();
      store.subscribe(sub1);
      store.subscribe(sub2);

      store.setState({ approved: 70 });
      expect(sub1).toHaveBeenCalledTimes(1);
      expect(sub2).toHaveBeenCalledTimes(1);
    });

    it('should call all subscribers in order', () => {
      const callOrder = [];
      store.subscribe(() => {
        callOrder.push(1);
      });
      store.subscribe(() => {
        callOrder.push(2);
      });

      store.setState({ approved: 70 });
      expect(callOrder).toEqual([1, 2]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle setState with empty object', () => {
      const subscriber = jest.fn();
      store.subscribe(subscriber);
      const oldState = store.getState();

      store.setState({});
      expect(subscriber).not.toHaveBeenCalled();
      expect(store.getState()).toEqual(oldState);
    });

    it('should handle setState with null values', () => {
      store.setState({ sections: null });
      const state = store.getState();
      expect(state.sections).toEqual([]);
    });

    it('should handle multiple rapid setState calls', () => {
      const subscriber = jest.fn();
      store.subscribe(subscriber);

      store.setState({ approved: 61 });
      store.setState({ approved: 62 });
      store.setState({ approved: 63 });

      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(store.getState().approved).toBe(63);
    });

    it('should handle very large state objects', () => {
      const largeState = {
        total: 10000,
        approved: 5000,
        underReview: 2000,
        sections: Array.from({ length: 100 }, (_, i) => ({
          id: `sec${i}`,
          name: `Section ${i}`,
          items: Array.from({ length: 50 }, (_, j) => ({
            count: j,
            label: `Item ${j}`,
          })),
        })),
      };
      store = createStore(largeState);
      const state = store.getState();
      expect(state.sections).toHaveLength(100);
      expect(state.sections[0].items).toHaveLength(50);
    });
  });
});
