// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { catalogThemes } from "../data/catalog";
import { FEATURED_IDS } from "../data/featured";
import { Rail } from "./Rail";

function renderRail(props?: Partial<Parameters<typeof Rail>[0]>) {
  return render(
    <Rail onSelect={() => {}} focusedThemeId="tokyo-night" pinnedThemeIds={new Set()} {...props} />,
  );
}

describe("Rail", () => {
  it("renders three sections in order: Featured, Light, Dark", () => {
    renderRail();
    const sections = screen
      .getAllByRole("region")
      .filter((node) =>
        ["Featured", "Light", "Dark"].includes(node.getAttribute("aria-label") ?? ""),
      );
    const labels = sections.map((s) => s.getAttribute("aria-label"));
    expect(labels).toEqual(["Featured", "Light", "Dark"]);
  });

  it("places exactly five rows in Featured in the configured order", () => {
    renderRail();
    const featured = screen.getByRole("region", { name: "Featured" });
    const buttons = within(featured).getAllByRole("button");
    // First button is the search trigger lives outside the section; section has 5 rows.
    expect(buttons).toHaveLength(5);
    const names = buttons.map((b) => b.getAttribute("aria-label"));
    const expected = FEATURED_IDS.map(
      (id) => catalogThemes.find((c) => c.theme.id === id)?.theme.name ?? "",
    );
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

  it("marks the focused theme as selected", () => {
    renderRail({ focusedThemeId: "solarized-light" });
    const selected = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-current") === "true");
    expect(selected).toHaveLength(2);
    // Featured + Light section both show Solarized Light, both flagged.
    expect(selected.every((node) => node.getAttribute("aria-label") === "Solarized Light")).toBe(
      true,
    );
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

  it("folds diacritics so a plain-ASCII query matches an accented theme name", async () => {
    const user = userEvent.setup();
    renderRail();
    await user.type(screen.getByRole("textbox", { name: /filter by name/i }), "rose pine");

    expect(screen.getAllByRole("button", { name: "Rosé Pine Dawn" }).length).toBeGreaterThan(0);
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
