// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { SceneId } from "../pane/SceneTabs";
import { CompareView, UNDO_TIMEOUT_MS } from "./CompareView";
import { type CompareSlotId, type CompareState, compareReducer } from "./compareState";

function stateWith(partial: Partial<CompareState>): CompareState {
  return {
    a: null,
    b: null,
    lastPinned: null,
    enteredFromThemeId: "tokyo-night",
    ...partial,
  };
}

function Harness({
  initial,
  onUnpin,
  onExit,
}: {
  initial: CompareState;
  onUnpin?: (slot: CompareSlotId) => void;
  onExit?: () => void;
}) {
  const [state, setState] = useState(initial);
  const [scene, setScene] = useState<SceneId>("workspace");
  return (
    <CompareView
      state={state}
      scene={scene}
      onSceneChange={setScene}
      onUnpin={(slot) => {
        onUnpin?.(slot);
        setState((current) => compareReducer(current, { type: "unpin", slot }));
      }}
      onPin={(themeId) => setState((current) => compareReducer(current, { type: "pin", themeId }))}
      onExit={onExit ?? (() => {})}
    />
  );
}

describe("CompareView", () => {
  it("renders both pinned themes in side-by-side slots", () => {
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    expect(
      screen.getByRole("region", { name: /compare slot a: tokyo night/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /compare slot b: solarized light/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty placeholder for the unfilled slot", () => {
    render(<Harness initial={stateWith({ a: "tokyo-night", lastPinned: "a" })} />);

    expect(screen.getByRole("region", { name: /compare slot b, empty/i })).toHaveTextContent(
      /pin a theme/i,
    );
  });

  it("syncs the scene across both slots", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(screen.getByRole("tab", { name: /settings/i }));

    const slotA = screen.getByRole("region", { name: /compare slot a/i });
    const slotB = screen.getByRole("region", { name: /compare slot b/i });
    expect(within(slotA).getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
    expect(within(slotB).getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
  });

  it("announces the active comparison through a polite live region", () => {
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/tokyo night/i);
    expect(status).toHaveTextContent(/solarized light/i);
  });

  it("renders a visible Back to catalog control that exits compare mode", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness initial={stateWith({ a: "tokyo-night", lastPinned: "a" })} onExit={onExit} />);

    await user.click(screen.getByRole("button", { name: /back to catalog/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("surfaces the pin acknowledgement visibly, not only to screen readers", () => {
    render(<Harness initial={stateWith({ a: "tokyo-night", lastPinned: "a" })} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/tokyo night pinned/i);
    // The single-pin acknowledgement must be visible to sighted users, not hidden
    // off-screen the way the prior screen-reader-only live region was.
    expect(status).not.toHaveClass("sr-only");
  });

  it("does not offer Pin to compare on an already-pinned slot", () => {
    render(<Harness initial={stateWith({ a: "tokyo-night", lastPinned: "a" })} />);

    const slotA = screen.getByRole("region", { name: /compare slot a: tokyo night/i });
    expect(
      within(slotA).queryByRole("button", { name: /pin to compare/i }),
    ).not.toBeInTheDocument();
    expect(
      within(slotA).getByRole("button", { name: /remove tokyo night from comparison/i }),
    ).toBeInTheDocument();
  });

  it("unpins a slot through its remove control", async () => {
    const user = userEvent.setup();
    const onUnpin = vi.fn();
    render(
      <Harness
        initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })}
        onUnpin={onUnpin}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );

    expect(onUnpin).toHaveBeenCalledWith("b");
    expect(screen.getByRole("region", { name: /compare slot b, empty/i })).toBeInTheDocument();
  });

  it("offers an Undo affordance in the status line after a slot is unpinned", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/slot b cleared/i);
    expect(within(status).getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  it("restores the unpinned theme to its slot when Undo is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );
    await user.click(within(screen.getByRole("status")).getByRole("button", { name: /undo/i }));

    expect(
      screen.getByRole("region", { name: /compare slot b: solarized light/i }),
    ).toBeInTheDocument();
    // The notice dismisses once the slot is refilled.
    expect(screen.getByRole("status")).not.toHaveTextContent(/cleared/i);
  });

  it("moves focus to the Undo control so a keyboard user lands on the recovery", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );

    // Unpinning removes the trigger from the DOM; focus must not fall to <body>.
    expect(within(screen.getByRole("status")).getByRole("button", { name: /undo/i })).toHaveFocus();
  });

  it("labels the Undo control with the theme and slot it restores", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );

    expect(
      screen.getByRole("button", { name: /restore solarized light to slot b/i }),
    ).toBeInTheDocument();
  });

  it("holds the auto-dismiss while Undo has focus, then dismisses once it blurs", () => {
    vi.useFakeTimers();
    try {
      render(
        <Harness
          initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })}
        />,
      );

      act(() => {
        fireEvent.click(
          screen.getByRole("button", { name: /remove solarized light from comparison/i }),
        );
      });
      const undo = within(screen.getByRole("status")).getByRole("button", { name: /undo/i });
      // Undo is auto-focused, so the countdown is held past its window.
      expect(undo).toHaveFocus();
      act(() => {
        vi.advanceTimersByTime(UNDO_TIMEOUT_MS + 1000);
      });
      expect(screen.getByRole("status")).toHaveTextContent(/cleared/i);

      // Blurring releases the hold; the countdown then runs out and dismisses.
      act(() => {
        fireEvent.focusOut(undo);
      });
      act(() => {
        vi.advanceTimersByTime(UNDO_TIMEOUT_MS + 1000);
      });
      expect(screen.getByRole("status")).not.toHaveTextContent(/cleared/i);
    } finally {
      vi.useRealTimers();
    }
  });
});
