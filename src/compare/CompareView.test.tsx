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
    <>
      {/* Stands in for an out-of-view pin source (rail row / ⌘K command) firing while compare is shown. */}
      <button
        type="button"
        onClick={() =>
          setState((current) =>
            compareReducer(current, { type: "pin", themeId: "catppuccin-mocha" }),
          )
        }
      >
        Pin third theme
      </button>
      <CompareView
        state={state}
        scene={scene}
        onSceneChange={setScene}
        onUnpin={(slot) => {
          onUnpin?.(slot);
          setState((current) => compareReducer(current, { type: "unpin", slot }));
        }}
        onRestore={(slot, themeId) =>
          setState((current) => compareReducer(current, { type: "restore", slot, themeId }))
        }
        onExit={onExit ?? (() => {})}
      />
    </>
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

  it("offers an Undo to recover the displaced theme when a third pin replaces a full slot", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    // Both slots full, lastPinned "b" → slot a is least-recent and gets replaced.
    await user.click(screen.getByRole("button", { name: /pin third theme/i }));

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/slot a replaced/i);
    expect(within(status).getByRole("button", { name: /undo/i })).toBeInTheDocument();
  });

  it("restores the displaced theme to its original slot when Undo follows a replacement", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(screen.getByRole("button", { name: /pin third theme/i }));
    // The displacer takes the least-recent slot a.
    expect(
      screen.getByRole("region", { name: /compare slot a: catppuccin mocha/i }),
    ).toBeInTheDocument();

    await user.click(within(screen.getByRole("status")).getByRole("button", { name: /undo/i }));

    // Undo puts the displaced theme back into slot a, evicting the displacer.
    expect(
      screen.getByRole("region", { name: /compare slot a: tokyo night/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent(/replaced/i);
  });

  it("flags the slot a replacement landed in so a mouse user sees where the swap happened", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(screen.getByRole("button", { name: /pin third theme/i }));

    // The replace path never steals focus, so the changed slot must carry its own
    // peripheral cue or the swap goes unnoticed before the Undo window closes.
    expect(
      screen.getByRole("region", { name: /compare slot a: catppuccin mocha/i }),
    ).toHaveAttribute("data-attention", "true");
    // The untouched slot stays quiet.
    expect(
      screen.getByRole("region", { name: /compare slot b: solarized light/i }),
    ).not.toHaveAttribute("data-attention");
  });

  it("drops the slot attention cue once the replacement notice is gone", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    await user.click(screen.getByRole("button", { name: /pin third theme/i }));
    await user.click(within(screen.getByRole("status")).getByRole("button", { name: /undo/i }));

    expect(
      screen.getByRole("region", { name: /compare slot a: tokyo night/i }),
    ).not.toHaveAttribute("data-attention");
  });

  it("keeps focus on the pin source after a replacement so rapid pinning stays fluid", async () => {
    const user = userEvent.setup();
    render(
      <Harness initial={stateWith({ a: "tokyo-night", b: "solarized-light", lastPinned: "b" })} />,
    );

    const trigger = screen.getByRole("button", { name: /pin third theme/i });
    await user.click(trigger);

    // Unlike an unpin (which destroys its trigger), a replacement leaves the rail row /
    // ⌘K command in place. The Undo is announced through the polite status region, but
    // yanking focus to it would interrupt rapid pinning, so focus must stay put.
    expect(
      within(screen.getByRole("status")).getByRole("button", { name: /undo/i }),
    ).toBeInTheDocument();
    expect(trigger).toHaveFocus();
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
