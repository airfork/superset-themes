// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { RailRow } from "./RailRow";

function entryFor(id: string): CatalogThemeEntry {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected catalog entry ${id}`);
  }
  return found;
}

describe("RailRow", () => {
  const tokyo = entryFor("tokyo-night");
  const solarizedLight = entryFor("solarized-light");

  it("labels featured dark themes with an explicit mode badge instead of an ambiguous dot", () => {
    render(<RailRow entry={tokyo} selected={false} pinned={false} variant="featured" />);
    const badge = screen.getByTestId("rail-mode-badge");
    expect(badge).toHaveAttribute("data-mode", "dark");
    expect(badge).toHaveTextContent("Dark");
    expect(screen.queryByTestId("rail-accent-dot")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tokyo Night, Dark theme" })).toBeInTheDocument();
  });

  it("labels featured light themes with an explicit mode badge instead of a low-contrast ring", () => {
    render(<RailRow entry={solarizedLight} selected={false} pinned={false} variant="featured" />);
    const badge = screen.getByTestId("rail-mode-badge");
    expect(badge).toHaveAttribute("data-mode", "light");
    expect(badge).toHaveTextContent("Light");
    expect(screen.queryByTestId("rail-accent-dot")).not.toBeInTheDocument();
  });

  it("omits the mode badge from basic rows because Light and Dark sections already label mode", () => {
    render(<RailRow entry={tokyo} selected={false} pinned={false} variant="basic" />);

    expect(screen.queryByTestId("rail-mode-badge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("rail-accent-dot")).not.toBeInTheDocument();
  });

  it("shows family eyebrow and a five-swatch glimpse on featured variant", () => {
    const rose = entryFor("rose-pine-dawn");
    render(<RailRow entry={rose} selected={false} pinned={false} variant="featured" />);
    // Family eyebrow is distinct from theme name ("Rosé Pine" vs "Rosé Pine Dawn").
    expect(screen.getByText(rose.meta.family, { exact: true })).toBeInTheDocument();
    const swatches = screen.getAllByTestId("rail-swatch");
    expect(swatches).toHaveLength(5);
    expect(swatches[0]).toHaveStyle({ backgroundColor: rose.theme.ui.primary });
  });

  it("suppresses the family eyebrow when it merely repeats the theme name", () => {
    // Tokyo Night's family label is literally "Tokyo Night", so an eyebrow above
    // the identically-named row is pure duplication. Distinct families (Rosé Pine
    // over Rosé Pine Dawn, above) still show theirs.
    expect(tokyo.meta.family).toBe(tokyo.theme.name);
    const { container } = render(
      <RailRow entry={tokyo} selected={false} pinned={false} variant="featured" />,
    );
    expect(container.querySelector(".rail-row__eyebrow")).toBeNull();
  });

  it("shows a pin glyph (with accessible label) when pinned", () => {
    render(<RailRow entry={tokyo} selected={false} pinned={true} variant="basic" />);
    expect(screen.getByLabelText(/pinned/i)).toBeInTheDocument();
  });

  it("renders no pin glyph when not pinned", () => {
    render(<RailRow entry={tokyo} selected={false} pinned={false} variant="basic" />);
    expect(screen.queryByLabelText(/pinned/i)).not.toBeInTheDocument();
  });

  it("calls onSelect when activated", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <RailRow entry={tokyo} selected={false} pinned={false} variant="basic" onSelect={onSelect} />,
    );
    await user.click(screen.getByRole("button", { name: /tokyo night/i }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("exposes aria-current=true when selected", () => {
    render(<RailRow entry={tokyo} selected={true} pinned={false} variant="basic" />);
    expect(screen.getByRole("button", { name: /tokyo night/i })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("annotates the accessible name when the theme also appears in Featured", () => {
    // The section row (Dark/Light) of a featured theme is the row's second pass in
    // the roving sequence; a screen-reader user hears the name twice with no clue
    // why. The suffix back-references the earlier Featured listing.
    render(
      <RailRow
        entry={tokyo}
        selected={false}
        pinned={false}
        variant="basic"
        alsoInSection="Featured"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Tokyo Night, also in Featured" }),
    ).toBeInTheDocument();
  });

  it("composes the also-in-Featured annotation after the pinned state", () => {
    render(
      <RailRow
        entry={tokyo}
        selected={false}
        pinned={true}
        variant="basic"
        alsoInSection="Featured"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Tokyo Night, pinned for compare, also in Featured" }),
    ).toBeInTheDocument();
  });
});
