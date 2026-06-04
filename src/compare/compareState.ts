export interface CompareState {
  // Left slot — also drives the chrome. There is always exactly one baseline.
  baseline: string;
  // Right slot — the "audition" slot. Every pick lands here.
  candidate: string | null;
}

export type CompareAction =
  | { type: "enter"; themeId: string }
  | { type: "pick"; themeId: string }
  | { type: "swap" }
  | { type: "clear" }
  | { type: "exit" };

// The empty baseline is a sentinel for "not yet resolved" — the route fills it
// from the focused theme on mount, so a real baseline always reaches the view.
export const INITIAL_COMPARE_STATE: CompareState = {
  baseline: "",
  candidate: null,
};

export function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "enter":
      return { baseline: action.themeId, candidate: null };
    case "pick":
      // Picking the theme that is already the baseline would compare it with
      // itself — ignore it so the candidate stays meaningful.
      if (action.themeId === state.baseline) {
        return state;
      }
      return { ...state, candidate: action.themeId };
    case "swap":
      if (state.candidate === null) {
        return state;
      }
      return { baseline: state.candidate, candidate: state.baseline };
    case "clear":
      return { ...state, candidate: null };
    case "exit":
      return INITIAL_COMPARE_STATE;
  }
}
