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
    <Rail
      onOpenPalette={() => {}}
      onSelect={() => {}}
      focusedThemeId="tokyo-night"
      pinnedThemeIds={new Set()}
      {...props}
    />,
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

  it("opens the palette when the search trigger is activated", async () => {
    const user = userEvent.setup();
    const onOpenPalette = vi.fn();
    renderRail({ onOpenPalette });
    await user.click(screen.getByRole("button", { name: /search themes/i }));
    expect(onOpenPalette).toHaveBeenCalledTimes(1);
  });
});
