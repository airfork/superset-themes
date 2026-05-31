export interface PaletteState {
  open: boolean;
  query: string;
  focusedIndex: number;
  // At rest the Actions shelf is one "More actions" teaser; activating it (or a
  // query that matches an action) expands the full list.
  actionsExpanded: boolean;
}

export type PaletteAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "setQuery"; query: string; focusedIndex?: number }
  | { type: "move"; direction: "up" | "down"; count: number }
  | { type: "expandActions"; focusedIndex: number }
  | { type: "submit" };

export const INITIAL_PALETTE_STATE: PaletteState = {
  open: false,
  query: "",
  focusedIndex: 0,
  actionsExpanded: false,
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
      return { open: true, query: "", focusedIndex: 0, actionsExpanded: false };
    case "close":
      return { ...state, open: false };
    case "setQuery":
      // Typing re-aims focus at the intent-ranked result (a verb query seeds the
      // matching action; otherwise the first theme) and re-collapses the shelf,
      // since a matching query reveals actions on its own.
      return {
        ...state,
        query: action.query,
        focusedIndex: action.focusedIndex ?? 0,
        actionsExpanded: false,
      };
    case "move": {
      const delta = action.direction === "down" ? 1 : -1;
      return { ...state, focusedIndex: clampIndex(state.focusedIndex + delta, action.count) };
    }
    case "expandActions":
      // Reveal the full Actions list and land focus on the first action (the
      // slot the teaser occupied).
      return { ...state, actionsExpanded: true, focusedIndex: action.focusedIndex };
    case "submit":
      // The caller runs the focused command, then the palette closes.
      return { ...state, open: false };
    default:
      return state;
  }
}
