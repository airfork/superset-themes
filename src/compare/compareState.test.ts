import { describe, expect, it } from "vitest";
import { type CompareState, compareReducer, INITIAL_COMPARE_STATE } from "./compareState";

function entered(themeId: string): CompareState {
  return compareReducer(INITIAL_COMPARE_STATE, { type: "enter", themeId });
}

describe("compareReducer", () => {
  it("enter sets the baseline and clears the candidate", () => {
    expect(entered("tokyo-night")).toEqual({ baseline: "tokyo-night", candidate: null });
  });

  it("pick always fills the candidate", () => {
    const state = compareReducer(entered("tokyo-night"), {
      type: "pick",
      themeId: "solarized-light",
    });
    expect(state).toEqual({ baseline: "tokyo-night", candidate: "solarized-light" });
  });

  it("a second pick replaces the candidate, never the baseline", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    state = compareReducer(state, { type: "pick", themeId: "rose-pine-dawn" });
    expect(state).toEqual({ baseline: "tokyo-night", candidate: "rose-pine-dawn" });
  });

  it("picking the current baseline is a no-op (no comparing a theme with itself)", () => {
    const base = entered("tokyo-night");
    expect(compareReducer(base, { type: "pick", themeId: "tokyo-night" })).toBe(base);
  });

  it("swap exchanges baseline and candidate", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    state = compareReducer(state, { type: "swap" });
    expect(state).toEqual({ baseline: "solarized-light", candidate: "tokyo-night" });
  });

  it("swap is reversible", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    const swapped = compareReducer(state, { type: "swap" });
    expect(compareReducer(swapped, { type: "swap" })).toEqual(state);
  });

  it("swap is a no-op when there is no candidate", () => {
    const base = entered("tokyo-night");
    expect(compareReducer(base, { type: "swap" })).toBe(base);
  });

  it("clear empties the candidate but keeps the baseline", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    state = compareReducer(state, { type: "clear" });
    expect(state).toEqual({ baseline: "tokyo-night", candidate: null });
  });

  it("exit returns to the clean initial state", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pick", themeId: "solarized-light" });
    expect(compareReducer(state, { type: "exit" })).toEqual(INITIAL_COMPARE_STATE);
  });

  it("does not mutate the previous state", () => {
    const base = entered("tokyo-night");
    const next = compareReducer(base, { type: "pick", themeId: "solarized-light" });
    expect(base).toEqual({ baseline: "tokyo-night", candidate: null });
    expect(next).not.toBe(base);
  });
});
