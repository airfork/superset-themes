import { describe, expect, it } from "vitest";
import { catalogThemes } from "../data/catalog";
import {
  type CatalogFilters,
  DEFAULT_CATALOG_FILTERS,
  filterCatalogThemes,
  getCatalogFilterOptions,
  sortCatalogThemes,
} from "./catalogFilters";

describe("filterCatalogThemes", () => {
  it("filters by light and dark theme type", () => {
    expect(
      filterCatalogThemes(catalogThemes, {
        ...DEFAULT_CATALOG_FILTERS,
        type: "light",
      }).map((entry) => entry.theme.id),
    ).toEqual(["aurora-light", "solarized-light"]);

    expect(
      filterCatalogThemes(catalogThemes, {
        ...DEFAULT_CATALOG_FILTERS,
        type: "dark",
      }).map((entry) => entry.theme.id),
    ).toEqual([
      "aurora-dark",
      "graphite-dark",
      "solarized-dark",
      "nord",
      "catppuccin-mocha",
      "dracula",
      "gruvbox-dark",
      "tokyo-night",
    ]);
  });

  it("filters by source, family, pair state, tags, warmth, contrast, and terminal quality", () => {
    const filters: CatalogFilters = {
      ...DEFAULT_CATALOG_FILTERS,
      contrastTier: "high",
      family: "Graphite",
      paired: "unpaired",
      source: "fixture",
      styleTags: new Set(["high-contrast"]),
      terminalPaletteQuality: "balanced",
      warmth: "neutral",
    };

    expect(filterCatalogThemes(catalogThemes, filters).map((entry) => entry.theme.id)).toEqual([
      "graphite-dark",
    ]);
  });

  it("filters by accent hue range including wraparound", () => {
    expect(
      filterCatalogThemes(catalogThemes, {
        ...DEFAULT_CATALOG_FILTERS,
        accentHueRange: { end: 210, start: 140 },
      }).map((entry) => entry.theme.id),
    ).toEqual(["aurora-light", "aurora-dark", "solarized-light", "solarized-dark", "nord"]);

    expect(
      filterCatalogThemes(catalogThemes, {
        ...DEFAULT_CATALOG_FILTERS,
        accentHueRange: { end: 20, start: 340 },
      }).map((entry) => entry.theme.id),
    ).toEqual(["graphite-dark"]);
  });

  it("returns distinct filter options derived from the catalog", () => {
    expect(getCatalogFilterOptions(catalogThemes)).toMatchObject({
      contrastTiers: ["high", "standard"],
      families: [
        "Aurora",
        "Catppuccin",
        "Dracula",
        "Graphite",
        "Gruvbox",
        "Nord",
        "Solarized",
        "Tokyo Night",
      ],
      sources: ["fixture", "upstream-port"],
      styleTags: [
        "arctic",
        "balanced",
        "classic",
        "clear",
        "cool",
        "editorial",
        "focused",
        "high-contrast",
        "low-glare",
        "neon",
        "neutral",
        "pastel",
        "retro",
        "terminal-rich",
        "warm",
        "warm-accent",
      ],
      terminalPaletteQualities: ["balanced", "rich"],
      warmths: ["cool", "neutral", "warm"],
    });
  });
});

describe("sortCatalogThemes", () => {
  it("sorts by name, family, accent hue, and contrast tier", () => {
    expect(sortCatalogThemes(catalogThemes, "name").map((entry) => entry.theme.id)).toEqual([
      "aurora-dark",
      "aurora-light",
      "catppuccin-mocha",
      "dracula",
      "graphite-dark",
      "gruvbox-dark",
      "nord",
      "solarized-dark",
      "solarized-light",
      "tokyo-night",
    ]);

    expect(sortCatalogThemes(catalogThemes, "family").map((entry) => entry.theme.id)).toEqual([
      "aurora-dark",
      "aurora-light",
      "catppuccin-mocha",
      "dracula",
      "graphite-dark",
      "gruvbox-dark",
      "nord",
      "solarized-dark",
      "solarized-light",
      "tokyo-night",
    ]);

    expect(sortCatalogThemes(catalogThemes, "accentHue").map((entry) => entry.theme.id)).toEqual([
      "graphite-dark",
      "gruvbox-dark",
      "aurora-light",
      "aurora-dark",
      "nord",
      "solarized-light",
      "solarized-dark",
      "catppuccin-mocha",
      "tokyo-night",
      "dracula",
    ]);

    expect(sortCatalogThemes(catalogThemes, "contrast").map((entry) => entry.theme.id)).toEqual([
      "graphite-dark",
      "aurora-dark",
      "solarized-dark",
      "nord",
      "catppuccin-mocha",
      "dracula",
      "gruvbox-dark",
      "tokyo-night",
      "aurora-light",
      "solarized-light",
    ]);
  });
});
