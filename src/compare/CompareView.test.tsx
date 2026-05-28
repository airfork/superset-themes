// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { SceneId } from "../pane/SceneTabs";
import { CompareView } from "./CompareView";
import type { CompareSlotId, CompareState } from "./compareState";

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
  onRepin,
}: {
  initial: CompareState;
  onUnpin?: (slot: CompareSlotId) => void;
  onRepin?: (themeId: string) => void;
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
        setState((current) => ({ ...current, [slot]: null }));
      }}
      onRepin={onRepin ?? (() => {})}
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
});
