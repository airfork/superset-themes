// A small undo/redo history with a cursor. `commit` drops any redo branch ahead
// of the cursor; when a commit carries the same `coalesceKey` as the previous one
// and the cursor is at the tip, it replaces the tip instead of appending, so a
// burst of edits to the same target (e.g. a color-picker drag firing many times a
// second) collapses into a single undo step.
export interface DraftHistory<T> {
  index: number;
  lastCoalesceKey: string | null;
  stack: T[];
}

export function initHistory<T>(initial: T): DraftHistory<T> {
  return { index: 0, lastCoalesceKey: null, stack: [initial] };
}

export function currentDraft<T>(history: DraftHistory<T>): T {
  const draft = history.stack[history.index];
  if (draft === undefined) {
    throw new Error("draft history cursor is out of bounds");
  }
  return draft;
}

export function canUndo<T>(history: DraftHistory<T>): boolean {
  return history.index > 0;
}

export function canRedo<T>(history: DraftHistory<T>): boolean {
  return history.index < history.stack.length - 1;
}

export function commit<T>(
  history: DraftHistory<T>,
  next: T,
  coalesceKey: string | null = null,
): DraftHistory<T> {
  const atTip = history.index === history.stack.length - 1;

  if (coalesceKey !== null && atTip && history.lastCoalesceKey === coalesceKey) {
    const stack = history.stack.slice();
    stack[history.index] = next;
    return { index: history.index, lastCoalesceKey: coalesceKey, stack };
  }

  const stack = history.stack.slice(0, history.index + 1);
  stack.push(next);
  return { index: stack.length - 1, lastCoalesceKey: coalesceKey, stack };
}

export function undo<T>(history: DraftHistory<T>): DraftHistory<T> {
  if (!canUndo(history)) {
    return history;
  }
  // Reset the coalesce key so the next edit after stepping back never folds into
  // a pre-undo entry.
  return { ...history, index: history.index - 1, lastCoalesceKey: null };
}

export function redo<T>(history: DraftHistory<T>): DraftHistory<T> {
  if (!canRedo(history)) {
    return history;
  }
  return { ...history, index: history.index + 1, lastCoalesceKey: null };
}
