import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import { searchCatalogThemes } from "./catalogSearch";

describe("searchCatalogThemes", () => {
  it("searches theme names, descriptions, families, tags, and notes", () => {
    expect(searchCatalogThemes(catalogThemes, "aurora").map((entry) => entry.theme.id)).toEqual([
      "aurora-light",
      "aurora-dark",
      "nord",
    ]);

    expect(
      searchCatalogThemes(catalogThemes, "terminal-rich").map((entry) => entry.theme.id),
    ).toEqual([
      "aurora-dark",
      "nord",
      "catppuccin-mocha",
      "dracula",
      "gruvbox-dark",
      "tokyo-night",
    ]);

    expect(
      searchCatalogThemes(catalogThemes, "neutral graphite surfaces").map(
        (entry) => entry.theme.id,
      ),
    ).toEqual(["graphite-dark"]);
  });

  it("is case-insensitive, trims whitespace, and returns all entries for empty queries", () => {
    expect(
      searchCatalogThemes(catalogThemes, "  GRAPHITE  ").map((entry) => entry.theme.id),
    ).toEqual(["graphite-dark"]);

    expect(searchCatalogThemes(catalogThemes, "").map((entry) => entry.theme.id)).toEqual([
      "aurora-light",
      "aurora-dark",
      "graphite-dark",
      "solarized-light",
      "solarized-dark",
      "nord",
      "catppuccin-mocha",
      "dracula",
      "gruvbox-dark",
      "tokyo-night",
      "rose-pine-dawn",
      "one-dark",
    ]);
  });
});
