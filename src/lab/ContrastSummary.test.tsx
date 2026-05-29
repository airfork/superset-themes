import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import type { SupersetTheme } from "../theme-core/themeTypes";
import { ContrastSummary } from "./ContrastSummary";

const base = getCatalogThemeById("aurora-light");

if (!base) {
  throw new Error("Expected aurora-light catalog entry.");
}

const baseTheme = base.theme;

// Collapse the muted-text pair onto the background so its ratio is 1.0:1 — a
// guaranteed AA failure regardless of the base theme's other tokens.
function themeWithUnreadableMuted(): SupersetTheme {
  return {
    ...baseTheme,
    ui: { ...baseTheme.ui, mutedForeground: baseTheme.ui.background },
  };
}

describe("ContrastSummary", () => {
  it("flags the muted-text pair as an AA failure when contrast is too low", () => {
    render(<ContrastSummary theme={themeWithUnreadableMuted()} />);

    expect(screen.getByRole("button", { name: /muted.*aa fail/i })).toBeInTheDocument();
  });

  it("reports the offending token when a failing pair is clicked", async () => {
    const user = userEvent.setup();
    const onSelectToken = vi.fn();
    render(<ContrastSummary onSelectToken={onSelectToken} theme={themeWithUnreadableMuted()} />);

    await user.click(screen.getByRole("button", { name: /muted.*aa fail/i }));

    expect(onSelectToken).toHaveBeenCalledWith("mutedForeground");
  });
});
