// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getCatalogThemeById } from "../data/fixtures";
import { createDraftFromCatalogEntry } from "./draftTheme";
import { TokensSection } from "./TokensSection";

const base = getCatalogThemeById("aurora-light");

if (!base) {
  throw new Error("Expected aurora-light catalog entry.");
}

const renderTokens = () =>
  render(
    <TokensSection
      draft={createDraftFromCatalogEntry(base)}
      onRerollGroup={vi.fn()}
      onTerminalTokenChange={vi.fn()}
      onUiTokenChange={vi.fn()}
    />,
  );

describe("TokensSection", () => {
  it("filters the token list to labels matching the query", async () => {
    const user = userEvent.setup();
    renderTokens();

    expect(screen.getByText("Card foreground")).toBeInTheDocument();
    expect(screen.getByText("Bright magenta")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: /filter tokens/i }), "bright");

    expect(screen.getByText("Bright magenta")).toBeInTheDocument();
    expect(screen.queryByText("Card foreground")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches the filter", async () => {
    const user = userEvent.setup();
    renderTokens();

    await user.type(screen.getByRole("searchbox", { name: /filter tokens/i }), "zzz");

    expect(screen.getByText(/no tokens match/i)).toBeInTheDocument();
  });
});
