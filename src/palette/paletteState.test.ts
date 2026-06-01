import { describe, expect, it } from "vitest";
import { INITIAL_PALETTE_STATE, type PaletteState, paletteReducer } from "./paletteState";

const baseState: PaletteState = {
  open: true,
  query: "",
  focusedIndex: 0,
};

describe("paletteReducer", () => {
  it("opens with a cleared query and reset focus", () => {
    const dirty: PaletteState = {
      open: false,
      query: "rose",
      focusedIndex: 4,
    };
    expect(paletteReducer(dirty, { type: "open" })).toEqual({
      open: true,
      query: "",
      focusedIndex: 0,
    });
  });

  it("closes without disturbing the query", () => {
    const open: PaletteState = { ...baseState, query: "sol", focusedIndex: 2 };
    expect(paletteReducer(open, { type: "close" }).open).toBe(false);
  });

  it("resets focus to the top when the query changes", () => {
    const state: PaletteState = { ...baseState, focusedIndex: 5 };
    expect(paletteReducer(state, { type: "setQuery", query: "tok" })).toEqual({
      open: true,
      query: "tok",
      focusedIndex: 0,
    });
  });

  it("moves focus down, clamped to the last result", () => {
    const once = paletteReducer(baseState, { type: "move", direction: "down", count: 3 });
    expect(once.focusedIndex).toBe(1);
    const atEnd = paletteReducer(
      { ...baseState, focusedIndex: 2 },
      {
        type: "move",
        direction: "down",
        count: 3,
      },
    );
    expect(atEnd.focusedIndex).toBe(2);
  });

  it("moves focus up, clamped to zero", () => {
    expect(
      paletteReducer(baseState, { type: "move", direction: "up", count: 3 }).focusedIndex,
    ).toBe(0);
  });

  it("never moves focus past an empty result list", () => {
    const state: PaletteState = { ...baseState, query: "zzz" };
    expect(paletteReducer(state, { type: "move", direction: "down", count: 0 }).focusedIndex).toBe(
      0,
    );
  });

  it("closes on submit", () => {
    const state: PaletteState = { ...baseState, query: "rose", focusedIndex: 1 };
    expect(paletteReducer(state, { type: "submit" }).open).toBe(false);
  });

  it("returns a new object rather than mutating", () => {
    const next = paletteReducer(INITIAL_PALETTE_STATE, { type: "open" });
    expect(next).not.toBe(INITIAL_PALETTE_STATE);
    expect(INITIAL_PALETTE_STATE).toEqual({
      open: false,
      query: "",
      focusedIndex: 0,
    });
  });
});
