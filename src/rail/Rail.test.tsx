// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BASELINE_IDS } from "../data/baseline";
import { catalogThemes } from "../data/catalog";
import { FEATURED_IDS } from "../data/featured";
import { Rail } from "./Rail";

function renderRail(props?: Partial<Parameters<typeof Rail>[0]>) {
  return render(
    <Rail onSelect={() => {}} focusedThemeId="tokyo-night" pinnedThemeIds={new Set()} {...props} />,
  );
}

function themeFor(id: string) {
  const found = catalogThemes.find((candidate) => candidate.theme.id === id);
  if (!found) {
    throw new Error(`Expected theme ${id}`);
  }
  return found.theme;
}

function featuredLabel(id: string) {
  const theme = themeFor(id);
  return `${theme.name}, ${theme.type === "light" ? "Light" : "Dark"} theme`;
}

describe("Rail", () => {
  it("renders four sections in order: Superset, Featured, Light, Dark", () => {
    renderRail();
    const sections = screen
      .getAllByRole("region")
      .filter((node) =>
        ["Superset", "Featured", "Light", "Dark"].includes(node.getAttribute("aria-label") ?? ""),
      );
    const labels = sections.map((s) => s.getAttribute("aria-label"));
    expect(labels).toEqual(["Superset", "Featured", "Light", "Dark"]);
  });

  it("places the Superset baseline rows before Featured", () => {
    renderRail();
    const baseline = screen.getByRole("region", { name: "Superset" });
    const buttons = within(baseline).getAllByRole("button");
    const expected = BASELINE_IDS.map(featuredLabel);

    expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual(expected);
  });

  it("places exactly five rows in Featured in the configured order", () => {
    renderRail();
    const featured = screen.getByRole("region", { name: "Featured" });
    const buttons = within(featured).getAllByRole("button");
    // First button is the search trigger lives outside the section; section has 5 rows.
    expect(buttons).toHaveLength(5);
    const names = buttons.map((b) => b.getAttribute("aria-label"));
    const expected = FEATURED_IDS.map(featuredLabel);
    expect(names).toEqual(expected);
  });

  it("alphabetizes the Light section by theme name", () => {
    renderRail();
    const light = screen.getByRole("region", { name: "Light" });
    const names = within(light)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label"));
    const sorted = [...names].sort((a, b) => (a ?? "").localeCompare(b ?? ""));
    expect(names).toEqual(sorted);
  });

  it("alphabetizes the Dark section by theme name", () => {
    renderRail();
    const dark = screen.getByRole("region", { name: "Dark" });
    const names = within(dark)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label"));
    const sorted = [...names].sort((a, b) => (a ?? "").localeCompare(b ?? ""));
    expect(names).toEqual(sorted);
  });

  it("does not repeat mode badges inside the dedicated Light and Dark sections", () => {
    renderRail();

    expect(
      within(screen.getByRole("region", { name: "Light" })).queryAllByTestId("rail-mode-badge"),
    ).toHaveLength(0);
    expect(
      within(screen.getByRole("region", { name: "Dark" })).queryAllByTestId("rail-mode-badge"),
    ).toHaveLength(0);
  });

  it("keeps mode badges in mixed-mode Superset and Featured sections", () => {
    renderRail();

    expect(
      within(screen.getByRole("region", { name: "Superset" })).getAllByTestId("rail-mode-badge"),
    ).toHaveLength(2);
    expect(
      within(screen.getByRole("region", { name: "Featured" })).getAllByTestId("rail-mode-badge"),
    ).toHaveLength(5);
  });

  it("marks the focused theme as selected", () => {
    renderRail({ focusedThemeId: "solarized-light" });
    const selected = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-current") === "true");
    expect(selected).toHaveLength(2);
    // Featured + Light section both show Solarized Light, both flagged. The Light
    // occurrence carries the back-reference; the Featured one stays plain.
    const labels = selected.map((node) => node.getAttribute("aria-label")).sort();
    expect(labels).toEqual(["Solarized Light, Light theme", "Solarized Light, also in Featured"]);
  });

  it("annotates a Superset baseline theme's section row while leaving its pinned row plain", () => {
    renderRail({ focusedThemeId: "superset-light" });
    const baseline = screen.getByRole("region", { name: "Superset" });
    const light = screen.getByRole("region", { name: "Light" });

    expect(
      within(baseline).getByRole("button", { name: "Superset Light, Light theme" }),
    ).toBeInTheDocument();
    expect(
      within(light).getByRole("button", { name: "Superset Light, also in Superset" }),
    ).toBeInTheDocument();
  });

  it("annotates a featured theme's section row while leaving its Featured row plain", () => {
    renderRail();
    const featured = screen.getByRole("region", { name: "Featured" });
    const dark = screen.getByRole("region", { name: "Dark" });
    // Tokyo Night is featured and dark: mode-labeled up top, back-referenced down in Dark.
    expect(
      within(featured).getByRole("button", { name: "Tokyo Night, Dark theme" }),
    ).toBeInTheDocument();
    expect(
      within(dark).getByRole("button", { name: "Tokyo Night, also in Featured" }),
    ).toBeInTheDocument();
  });

  it("leaves a non-featured theme's section row unannotated", () => {
    renderRail();
    const dark = screen.getByRole("region", { name: "Dark" });
    expect(within(dark).getByRole("button", { name: "Dracula" })).toBeInTheDocument();
    expect(within(dark).queryByRole("button", { name: "Dracula, also in Featured" })).toBeNull();
  });

  it("invokes onSelect with the theme id when a row is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderRail({ onSelect });
    const light = screen.getByRole("region", { name: "Light" });
    await user.click(within(light).getByRole("button", { name: /aurora light/i }));
    expect(onSelect).toHaveBeenCalledWith("aurora-light");
  });

  it("filters the visible rows to themes whose name matches the query", async () => {
    const user = userEvent.setup();
    renderRail();
    const filter = screen.getByRole("textbox", { name: /filter by name/i });
    await user.type(filter, "dracula");

    expect(screen.getByRole("button", { name: "Dracula" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tokyo Night" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aurora Light" })).not.toBeInTheDocument();
  });

  it("reports filter changes so ⌘K can carry the typed query over", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    renderRail({ onFilterChange });
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "rose");
    expect(onFilterChange).toHaveBeenLastCalledWith("rose");
  });

  it("folds diacritics so a plain-ASCII query matches an accented theme name", async () => {
    const user = userEvent.setup();
    renderRail();
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "rose pine");

    expect(screen.getAllByRole("button", { name: /Rosé Pine Dawn/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Dracula" })).not.toBeInTheDocument();
  });

  it("focuses the filter input when '/' is pressed on a rail row", async () => {
    const user = userEvent.setup();
    renderRail();
    const dark = screen.getByRole("region", { name: "Dark" });
    within(dark).getAllByRole("button")[0]?.focus();
    await user.keyboard("/");
    expect(screen.getByRole("textbox", { name: /filter by name/i })).toHaveFocus();
  });

  it("moves the roving tabstop onto a visible row after the filter hides the focused theme", async () => {
    const user = userEvent.setup();
    renderRail(); // focusedThemeId "tokyo-night" is hidden by the "dracula" query
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "dracula");
    expect(screen.getByRole("button", { name: "Dracula" })).toHaveAttribute("tabindex", "0");
  });

  it("hides a section heading when the filter leaves it with no rows", async () => {
    const user = userEvent.setup();
    renderRail();
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "dracula");

    // Only the Dark section still has a match; the empty Featured and Light
    // headings must not linger over nothing.
    expect(screen.getByRole("region", { name: "Dark" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Featured" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Light" })).not.toBeInTheDocument();
  });

  it("shows an empty state when no theme matches the query", async () => {
    const user = userEvent.setup();
    renderRail();
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "zzzzz");
    expect(screen.getByText(/no themes match/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dracula" })).not.toBeInTheDocument();
  });

  it("points to ⌘K for family and id search in the empty state", async () => {
    const user = userEvent.setup();
    renderRail();
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "zzzzz");
    expect(screen.getByText(/press ⌘K to search families/i)).toBeInTheDocument();
  });
});
