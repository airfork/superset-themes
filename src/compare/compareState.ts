export type CompareSlotId = "a" | "b";

export interface CompareState {
  a: string | null;
  b: string | null;
  lastPinned: CompareSlotId | null;
  enteredFromThemeId: string;
}

export type CompareAction =
  | { type: "enter"; themeId: string }
  | { type: "pin"; themeId: string }
  | { type: "unpin"; slot: CompareSlotId }
  | { type: "exit" };

export const INITIAL_COMPARE_STATE: CompareState = {
  a: null,
  b: null,
  lastPinned: null,
  enteredFromThemeId: "",
};

function pin(state: CompareState, themeId: string): CompareState {
  // Re-pinning a theme that is already shown only refreshes its recency.
  if (state.a === themeId) {
    return { ...state, lastPinned: "a" };
  }
  if (state.b === themeId) {
    return { ...state, lastPinned: "b" };
  }

  if (state.a === null) {
    return { ...state, a: themeId, lastPinned: "a" };
  }
  if (state.b === null) {
    return { ...state, b: themeId, lastPinned: "b" };
  }

  // Both slots full: replace the one that was NOT pinned most recently.
  // lastPinned "a" means slot b is the least-recently-pinned, and vice versa.
  // A null lastPinned (e.g. a deep link that filled both slots) defaults to
  // replacing slot a so the behaviour stays deterministic.
  const replace: CompareSlotId = state.lastPinned === "a" ? "b" : "a";
  return { ...state, [replace]: themeId, lastPinned: replace };
}

function unpin(state: CompareState, slot: CompareSlotId): CompareState {
  const other: CompareSlotId = slot === "a" ? "b" : "a";
  const lastPinned =
    state.lastPinned === slot ? (state[other] !== null ? other : null) : state.lastPinned;
  return { ...state, [slot]: null, lastPinned };
}

export function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "enter":
      return {
        a: null,
        b: null,
        lastPinned: null,
        enteredFromThemeId: action.themeId,
      };
    case "pin":
      return pin(state, action.themeId);
    case "unpin":
      return unpin(state, action.slot);
    case "exit":
      return INITIAL_COMPARE_STATE;
  }
}
