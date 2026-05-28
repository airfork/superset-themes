import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRailKeyboard } from "./useRailKeyboard";

const ids = ["a", "b", "c", "d"];

function keyEvent(key: string): React.KeyboardEvent {
  const event = {
    key,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  };
  return event as unknown as React.KeyboardEvent;
}

describe("useRailKeyboard", () => {
  it("starts at the index of the active id", () => {
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "b", onActivate: () => {}, onOpenPalette: () => {} }),
    );
    expect(result.current.focusedIndex).toBe(1);
  });

  it("ArrowDown moves focus and wraps at the end", () => {
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "a", onActivate: () => {}, onOpenPalette: () => {} }),
    );
    act(() => result.current.onKeyDown(keyEvent("ArrowDown")));
    expect(result.current.focusedIndex).toBe(1);
    act(() => result.current.onKeyDown(keyEvent("ArrowDown")));
    act(() => result.current.onKeyDown(keyEvent("ArrowDown")));
    expect(result.current.focusedIndex).toBe(3);
    act(() => result.current.onKeyDown(keyEvent("ArrowDown")));
    expect(result.current.focusedIndex).toBe(0); // wraps
  });

  it("ArrowUp wraps to the end from the first row", () => {
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "a", onActivate: () => {}, onOpenPalette: () => {} }),
    );
    act(() => result.current.onKeyDown(keyEvent("ArrowUp")));
    expect(result.current.focusedIndex).toBe(3);
  });

  it("Home / End jump to first / last", () => {
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "b", onActivate: () => {}, onOpenPalette: () => {} }),
    );
    act(() => result.current.onKeyDown(keyEvent("End")));
    expect(result.current.focusedIndex).toBe(3);
    act(() => result.current.onKeyDown(keyEvent("Home")));
    expect(result.current.focusedIndex).toBe(0);
  });

  it("Enter activates the focused id", () => {
    const onActivate = vi.fn();
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "a", onActivate, onOpenPalette: () => {} }),
    );
    act(() => result.current.onKeyDown(keyEvent("ArrowDown")));
    act(() => result.current.onKeyDown(keyEvent("Enter")));
    expect(onActivate).toHaveBeenCalledWith("b");
  });

  it("/ opens the palette", () => {
    const onOpenPalette = vi.fn();
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "a", onActivate: () => {}, onOpenPalette }),
    );
    act(() => result.current.onKeyDown(keyEvent("/")));
    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated keys", () => {
    const onActivate = vi.fn();
    const onOpenPalette = vi.fn();
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "a", onActivate, onOpenPalette }),
    );
    act(() => result.current.onKeyDown(keyEvent("x")));
    expect(result.current.focusedIndex).toBe(0);
    expect(onActivate).not.toHaveBeenCalled();
    expect(onOpenPalette).not.toHaveBeenCalled();
  });
});
