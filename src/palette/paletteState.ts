export interface PaletteState {
  open: boolean;
  query: string;
  focusedIndex: number;
}

export type PaletteAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "setQuery"; query: string }
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
      return { open: true, query: "", focusedIndex: 0 };
    case "close":
      return { ...state, open: false };
    case "setQuery":
      // Typing always re-aims focus at the first result.
      return { ...state, query: action.query, focusedIndex: 0 };
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
