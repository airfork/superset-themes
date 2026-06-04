// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { SceneId } from "../pane/SceneTabs";
import { CompareView } from "./CompareView";
import { type CompareState, compareReducer } from "./compareState";

function Harness({ initial, onExit }: { initial: CompareState; onExit?: () => void }) {
  const [state, setState] = useState(initial);
  const [scene, setScene] = useState<SceneId>("workspace");
  return (
    <CompareView
      state={state}
      scene={scene}
      onSceneChange={setScene}
      onSwap={() => setState((current) => compareReducer(current, { type: "swap" }))}
      onClearCandidate={() => setState((current) => compareReducer(current, { type: "clear" }))}
      onExit={onExit ?? (() => {})}
    />
  );
}

describe("CompareView", () => {
  it("renders the baseline and candidate in side-by-side slots", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    expect(screen.getByRole("region", { name: /baseline: tokyo night/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /comparing: solarized light/i })).toBeInTheDocument();
  });

  it("shows an empty placeholder for the candidate before a theme is picked", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} />);

    expect(screen.getByRole("region", { name: /comparing slot, empty/i })).toHaveTextContent(
      /pick a theme/i,
    );
  });

  it("syncs the scene across both slots", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    await user.click(screen.getByRole("tab", { name: /settings/i }));

    const baseline = screen.getByRole("region", { name: /baseline/i });
    const candidate = screen.getByRole("region", { name: /comparing:/i });
    expect(within(baseline).getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
    expect(within(candidate).getByRole("textbox", { name: /display name/i })).toBeInTheDocument();
  });

  it("announces the active comparison through a polite live region", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/comparing tokyo night with solarized light/i);
  });

  it("prompts to pick a candidate when only the baseline is set", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/tokyo night is your baseline/i);
    expect(status).toHaveTextContent(/pick a theme to compare/i);
    expect(status).not.toHaveClass("sr-only");
  });

  it("renders a visible Back to catalog control that exits compare mode", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} onExit={onExit} />);

    await user.click(screen.getByRole("button", { name: /back to catalog/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("offers a clear control on the candidate only, not the baseline", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    const baseline = screen.getByRole("region", { name: /baseline: tokyo night/i });
    expect(
      within(baseline).queryByRole("button", { name: /remove .* from comparison/i }),
    ).not.toBeInTheDocument();

    const candidate = screen.getByRole("region", { name: /comparing: solarized light/i });
    expect(
      within(candidate).getByRole("button", { name: /remove solarized light from comparison/i }),
    ).toBeInTheDocument();
  });

  it("clears the candidate back to the empty placeholder", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    await user.click(
      screen.getByRole("button", { name: /remove solarized light from comparison/i }),
    );

    expect(screen.getByRole("region", { name: /comparing slot, empty/i })).toBeInTheDocument();
  });

  it("swaps the baseline and candidate via the swap control", async () => {
    const user = userEvent.setup();
    render(<Harness initial={{ baseline: "tokyo-night", candidate: "solarized-light" }} />);

    await user.click(screen.getByRole("button", { name: /swap baseline and candidate/i }));

    expect(screen.getByRole("region", { name: /baseline: solarized light/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /comparing: tokyo night/i })).toBeInTheDocument();
  });

  it("disables the swap control when there is no candidate", () => {
    render(<Harness initial={{ baseline: "tokyo-night", candidate: null }} />);

    expect(screen.getByRole("button", { name: /swap baseline and candidate/i })).toBeDisabled();
  });
});
