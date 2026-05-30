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
      useRailKeyboard({ ids, activeId: "b", onFocusSearch: () => {} }),
    );
    expect(result.current.focusedIndex).toBe(1);
  });

  it("ArrowDown moves focus and wraps at the end", () => {
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "a", onFocusSearch: () => {} }),
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
      useRailKeyboard({ ids, activeId: "a", onFocusSearch: () => {} }),
    );
    act(() => result.current.onKeyDown(keyEvent("ArrowUp")));
    expect(result.current.focusedIndex).toBe(3);
  });

  it("Home / End jump to first / last", () => {
    const { result } = renderHook(() =>
      useRailKeyboard({ ids, activeId: "b", onFocusSearch: () => {} }),
    );
    act(() => result.current.onKeyDown(keyEvent("End")));
    expect(result.current.focusedIndex).toBe(3);
    act(() => result.current.onKeyDown(keyEvent("Home")));
    expect(result.current.focusedIndex).toBe(0);
  });

  // Enter and Space activation is handled by the native <button>'s click event, not the
  // keyboard hook. The Phase 4 web-design-guidelines pass removed the custom Enter/Space
  // handling to avoid double-firing onSelect.

  it("/ focuses the rail search input", () => {
    const onFocusSearch = vi.fn();
    const { result } = renderHook(() => useRailKeyboard({ ids, activeId: "a", onFocusSearch }));
    act(() => result.current.onKeyDown(keyEvent("/")));
    expect(onFocusSearch).toHaveBeenCalledTimes(1);
  });

  it("ignores unrelated keys", () => {
    const onFocusSearch = vi.fn();
    const { result } = renderHook(() => useRailKeyboard({ ids, activeId: "a", onFocusSearch }));
    act(() => result.current.onKeyDown(keyEvent("x")));
    expect(result.current.focusedIndex).toBe(0);
    expect(onFocusSearch).not.toHaveBeenCalled();
  });
});
