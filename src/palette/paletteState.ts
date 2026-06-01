export interface PaletteState {
  open: boolean;
  query: string;
  focusedIndex: number;
}

export type PaletteAction =
  | { type: "open"; query?: string; focusedIndex?: number }
  | { type: "close" }
  | { type: "setQuery"; query: string; focusedIndex?: number }
  | { type: "move"; direction: "up" | "down"; count: number }
  | { type: "submit" };

export const INITIAL_PALETTE_STATE: PaletteState = {
  open: false,
  query: "",
  focusedIndex: 0,
};

function clampIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.min(Math.max(index, 0), count - 1);
}

export function paletteReducer(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case "open":
      // Open with the seeded query (the rail's current filter) so a search typed
      // in the rail carries over; defaults to a blank palette when there's none.
      return {
        open: true,
        query: action.query ?? "",
        focusedIndex: action.focusedIndex ?? 0,
      };
    case "close":
      return { ...state, open: false };
    case "setQuery":
      // Typing re-aims focus at the intent-ranked result: a verb query seeds the
      // matching action; otherwise the first theme.
      return {
        ...state,
        query: action.query,
        focusedIndex: action.focusedIndex ?? 0,
      };
    case "move": {
      const delta = action.direction === "down" ? 1 : -1;
      return { ...state, focusedIndex: clampIndex(state.focusedIndex + delta, action.count) };
    }
    case "submit":
      // The caller runs the focused command, then the palette closes.
      return { ...state, open: false };
    default:
      return state;
  }
}
