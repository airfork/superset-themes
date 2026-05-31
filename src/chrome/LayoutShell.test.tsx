// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FocusedThemeProvider } from "../theme/FocusedThemeProvider";
import { LayoutShell } from "./LayoutShell";

function renderShell(onOpenPalette: () => void = () => {}) {
  return render(
    <FocusedThemeProvider initialThemeId="tokyo-night">
      <LayoutShell
        onOpenPalette={onOpenPalette}
        rail={<div data-testid="shell-rail">rail placeholder</div>}
        pane={<div data-testid="shell-pane">pane placeholder</div>}
      />
    </FocusedThemeProvider>,
  );
}

describe("LayoutShell", () => {
  it("renders top bar, rail, pane, and bottom bar landmarks", () => {
    renderShell();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: /themes/i })).toContainElement(
      screen.getByTestId("shell-rail"),
    );
    expect(screen.getByRole("main")).toContainElement(screen.getByTestId("shell-pane"));
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("forwards onOpenPalette to the top bar search trigger", async () => {
    const user = userEvent.setup();
    const onOpenPalette = vi.fn();
    renderShell(onOpenPalette);

    await user.click(screen.getByRole("button", { name: /search themes/i }));
    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });

  it("reads focused entry into the bottom bar", () => {
    renderShell();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Tokyo Night");
  });

  it("forwards onShowShortcuts to the focused-entry bottom bar", async () => {
    const user = userEvent.setup();
    const onShowShortcuts = vi.fn();
    render(
      <FocusedThemeProvider initialThemeId="tokyo-night">
        <LayoutShell
          onOpenPalette={() => {}}
          onShowShortcuts={onShowShortcuts}
          rail={<div data-testid="shell-rail">rail placeholder</div>}
          pane={<div data-testid="shell-pane">pane placeholder</div>}
        />
      </FocusedThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: /keyboard shortcuts/i }));
    expect(onShowShortcuts).toHaveBeenCalledTimes(1);
  });

  it("renders a provided bottomBar in place of the focused-entry bar", () => {
    render(
      <FocusedThemeProvider initialThemeId="tokyo-night">
        <LayoutShell
          onOpenPalette={() => {}}
          rail={<div data-testid="shell-rail">rail placeholder</div>}
          pane={<div data-testid="shell-pane">pane placeholder</div>}
          bottomBar={<footer>custom compare bar</footer>}
        />
      </FocusedThemeProvider>,
    );

    expect(screen.getByText("custom compare bar")).toBeInTheDocument();
    expect(screen.queryByText("Tokyo Night")).not.toBeInTheDocument();
  });

  it("renders a collapsed rail disclosure that controls the rail region", () => {
    renderShell();

    const toggle = screen.getByRole("button", { name: /browse themes/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const rail = screen.getByRole("complementary", { name: /themes/i });
    expect(rail.id).toBeTruthy();
    expect(toggle).toHaveAttribute("aria-controls", rail.id);
    expect(rail).not.toHaveAttribute("data-open");
  });

  it("expands the rail when the disclosure is toggled", async () => {
    const user = userEvent.setup();
    renderShell();

    const toggle = screen.getByRole("button", { name: /browse themes/i });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("complementary", { name: /themes/i })).toHaveAttribute("data-open");
  });

  it("collapses the disclosure after a theme row is activated, returning the preview to view", async () => {
    const user = userEvent.setup();
    render(
      <FocusedThemeProvider initialThemeId="tokyo-night">
        <LayoutShell
          onOpenPalette={() => {}}
          rail={
            <button type="button" className="rail-row">
              Nord
            </button>
          }
          pane={<div data-testid="shell-pane">pane placeholder</div>}
        />
      </FocusedThemeProvider>,
    );

    const toggle = screen.getByRole("button", { name: /browse themes/i });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Nord" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
