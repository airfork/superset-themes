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
});
