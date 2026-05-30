import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useCallback, useEffect, useReducer } from "react";

interface UseRailKeyboardOptions {
  ids: readonly string[];
  activeId: string;
  onFocusSearch: () => void;
}

interface UseRailKeyboardResult {
  focusedIndex: number;
  onKeyDown: (event: ReactKeyboardEvent) => void;
  setFocusedIndex: (index: number) => void;
}

type Action =
  | { type: "down" }
  | { type: "up" }
  | { type: "home" }
  | { type: "end" }
  | { type: "set"; index: number };

interface State {
  length: number;
  index: number;
}

function reducer(state: State, action: Action): State {
  if (state.length === 0) {
    return { ...state, index: 0 };
  }
  switch (action.type) {
    case "down":
      return { ...state, index: (state.index + 1) % state.length };
    case "up":
      return { ...state, index: (state.index - 1 + state.length) % state.length };
    case "home":
      return { ...state, index: 0 };
    case "end":
      return { ...state, index: state.length - 1 };
    case "set":
      return { ...state, index: Math.min(Math.max(0, action.index), state.length - 1) };
  }
}

function initialIndex(ids: readonly string[], activeId: string): number {
  const found = ids.indexOf(activeId);
  return found >= 0 ? found : 0;
}

export function useRailKeyboard({
  ids,
  activeId,
  onFocusSearch,
}: UseRailKeyboardOptions): UseRailKeyboardResult {
  const [state, dispatch] = useReducer(reducer, {
    length: ids.length,
    index: initialIndex(ids, activeId),
  });

  // Re-sync focus when the active id (URL theme) changes externally.
  useEffect(() => {
    dispatch({ type: "set", index: initialIndex(ids, activeId) });
  }, [activeId, ids]);

  const setFocusedIndex = useCallback((index: number) => {
    dispatch({ type: "set", index });
  }, []);

  // Enter and Space are handled by the native <button>'s click event so callers don't
  // double-fire onActivate. The hook only manages roving focus and the search shortcut.
  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          dispatch({ type: "down" });
          return;
        case "ArrowUp":
          event.preventDefault();
          dispatch({ type: "up" });
          return;
        case "Home":
          event.preventDefault();
          dispatch({ type: "home" });
          return;
        case "End":
          event.preventDefault();
          dispatch({ type: "end" });
          return;
        case "/":
          event.preventDefault();
          onFocusSearch();
          return;
        default:
          return;
      }
    },
    [onFocusSearch],
  );

  return {
    focusedIndex: state.index,
    onKeyDown,
    setFocusedIndex,
  };
}
