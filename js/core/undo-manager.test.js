import { createStore } from '../state/store.js';
import { UndoManager } from './undo-manager.js';

describe('UndoManager', () => {
  let store;
  let undoManager;

  beforeEach(() => {
    jest.useFakeTimers();
    store = createStore({ total: 100, approved: 50, underReview: 20, sections: [] });
    undoManager = new UndoManager(store, { debounceMs: 400, maxSnapshots: 5 });
    undoManager.start();
  });

  afterEach(() => {
    undoManager.stop();
    jest.useRealTimers();
  });

  it('records snapshots and allows undo', () => {
    store.setState({ approved: 60 });
    jest.advanceTimersByTime(400);
    store.setState({ approved: 70 });
    jest.advanceTimersByTime(400);

    expect(undoManager.canUndo()).toBe(true);
    expect(undoManager.canRedo()).toBe(false);

    const undoResult = undoManager.undo();
    expect(undoResult).toBe(true);
    expect(store.getState().approved).toBe(60);
    expect(undoManager.canRedo()).toBe(true);
  });

  it('allows redo after undo', () => {
    store.setState({ approved: 60 });
    jest.advanceTimersByTime(400);
    store.setState({ approved: 70 });
    jest.advanceTimersByTime(400);

    undoManager.undo();
    expect(store.getState().approved).toBe(60);

    const redoResult = undoManager.redo();
    expect(redoResult).toBe(true);
    expect(store.getState().approved).toBe(70);
  });

  it('does not create duplicate snapshots for unchanged state', () => {
    const oldState = store.getState();
    store.setState({ total: 100 });
    jest.advanceTimersByTime(400);

    expect(undoManager.canUndo()).toBe(false);
    expect(store.getState()).toEqual(oldState);
  });

  it('limits the undo stack to maxSnapshots', () => {
    for (let i = 0; i < 10; i += 1) {
      store.setState({ approved: 50 + i });
      jest.advanceTimersByTime(400);
    }

    expect(undoManager.canUndo()).toBe(true);
    expect(undoManager.undoStack.length).toBeLessThanOrEqual(5);
  });

  it('clears redo stack when a new action occurs', () => {
    store.setState({ approved: 60 });
    jest.advanceTimersByTime(400);
    undoManager.undo();
    expect(undoManager.canRedo()).toBe(true);

    store.setState({ approved: 55 });
    jest.advanceTimersByTime(400);
    expect(undoManager.canRedo()).toBe(false);
  });
});