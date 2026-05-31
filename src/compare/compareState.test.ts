import { describe, expect, it } from "vitest";
import { type CompareState, compareReducer, INITIAL_COMPARE_STATE } from "./compareState";

function entered(themeId: string): CompareState {
  return compareReducer(INITIAL_COMPARE_STATE, { type: "enter", themeId });
}

describe("compareReducer", () => {
  it("enter records the entry-state theme and clears both slots", () => {
    const state = entered("tokyo-night");
    expect(state).toEqual({
      a: null,
      b: null,
      lastPinned: null,
      enteredFromThemeId: "tokyo-night",
    });
  });

  it("first pin fills slot a", () => {
    const state = compareReducer(entered("tokyo-night"), {
      type: "pin",
      themeId: "solarized-light",
    });
    expect(state).toMatchObject({ a: "solarized-light", b: null, lastPinned: "a" });
  });

  it("second pin fills slot b", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" });
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" });
    expect(state).toMatchObject({
      a: "solarized-light",
      b: "rose-pine-dawn",
      lastPinned: "b",
    });
  });

  it("third pin replaces the least-recently-pinned slot", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // a, lastPinned a
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" }); // b, lastPinned b
    // Both full, lastPinned is "b" → slot a is least recently pinned → replaced.
    state = compareReducer(state, { type: "pin", themeId: "catppuccin-mocha" });
    expect(state).toMatchObject({
      a: "catppuccin-mocha",
      b: "rose-pine-dawn",
      lastPinned: "a",
    });
  });

  it("replaces the other slot when it is the least-recently-pinned one", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // a
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" }); // b
    state = compareReducer(state, { type: "pin", themeId: "catppuccin-mocha" }); // replaces a, lastPinned a
    // Now lastPinned is "a" → slot b is least recently pinned → replaced next.
    state = compareReducer(state, { type: "pin", themeId: "nord" });
    expect(state).toMatchObject({ a: "catppuccin-mocha", b: "nord", lastPinned: "b" });
  });

  it("re-pinning a theme already in a slot refreshes its recency without duplicating", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // a
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" }); // b, lastPinned b
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // already in a
    expect(state).toMatchObject({
      a: "solarized-light",
      b: "rose-pine-dawn",
      lastPinned: "a",
    });
  });

  it("restore puts a theme back into a specific slot, overwriting the displacer", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // a, lastPinned a
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" }); // b, lastPinned b
    // Both full, lastPinned b → slot a (least recent) is replaced; solarized-light is displaced.
    state = compareReducer(state, { type: "pin", themeId: "catppuccin-mocha" }); // a, lastPinned a
    state = compareReducer(state, { type: "restore", slot: "a", themeId: "solarized-light" });
    expect(state).toMatchObject({ a: "solarized-light", b: "rose-pine-dawn", lastPinned: "a" });
  });

  it("unpin clears a single slot and updates recency", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // a
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" }); // b, lastPinned b
    state = compareReducer(state, { type: "unpin", slot: "b" });
    expect(state).toMatchObject({ a: "solarized-light", b: null, lastPinned: "a" });
  });

  it("unpin resets recency to null when clearing the only filled slot", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" }); // a, lastPinned a
    state = compareReducer(state, { type: "unpin", slot: "a" });
    expect(state).toMatchObject({ a: null, b: null, lastPinned: null });
  });

  it("exit returns to a clean state", () => {
    let state = entered("tokyo-night");
    state = compareReducer(state, { type: "pin", themeId: "solarized-light" });
    state = compareReducer(state, { type: "pin", themeId: "rose-pine-dawn" });
    expect(compareReducer(state, { type: "exit" })).toEqual(INITIAL_COMPARE_STATE);
  });

  it("does not mutate the previous state", () => {
    const base = entered("tokyo-night");
    const next = compareReducer(base, { type: "pin", themeId: "solarized-light" });
    expect(base).toEqual({
      a: null,
      b: null,
      lastPinned: null,
      enteredFromThemeId: "tokyo-night",
    });
    expect(next).not.toBe(base);
  });
});
