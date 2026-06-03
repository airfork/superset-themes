import { describe, expect, it } from "vitest";
import { catalogThemes } from "./catalog";
import {
  FEATURED_IDS,
  getDefaultFocusedTheme,
  getFeaturedFirstThemes,
  getFeaturedThemes,
} from "./featured";

describe("featured themes", () => {
  it("exposes five hand-picked themes in deliberate order", () => {
    expect(FEATURED_IDS).toEqual([
      "tokyo-night",
      "catppuccin-mocha",
      "solarized-light",
      "rose-pine-dawn",
      "github-light",
    ]);
  });

  it("returns catalog entries in featured order with featuredRank set", () => {
    const featured = getFeaturedThemes();
    expect(featured).toHaveLength(5);
    expect(featured.map((entry) => entry.theme.id)).toEqual([
      "tokyo-night",
      "catppuccin-mocha",
      "solarized-light",
      "rose-pine-dawn",
      "github-light",
    ]);
    expect(featured.map((entry) => entry.meta.featuredRank)).toEqual([1, 2, 3, 4, 5]);
  });

  it("defaults the focused theme to the first featured slot", () => {
    expect(getDefaultFocusedTheme().theme.id).toBe("tokyo-night");
  });

  describe("getFeaturedFirstThemes", () => {
    it("leads with the featured themes in their deliberate order", () => {
      const ordered = getFeaturedFirstThemes();
      expect(ordered.slice(0, FEATURED_IDS.length).map((entry) => entry.theme.id)).toEqual([
        ...FEATURED_IDS,
      ]);
    });

    it("includes every catalog theme exactly once", () => {
      const ordered = getFeaturedFirstThemes();
      expect(ordered).toHaveLength(catalogThemes.length);
      expect(new Set(ordered.map((entry) => entry.theme.id)).size).toBe(catalogThemes.length);
    });

    it("trails the featured block with the remaining themes in catalog order", () => {
      const ordered = getFeaturedFirstThemes();
      const featuredSet = new Set<string>(FEATURED_IDS);
      const restInCatalogOrder = catalogThemes
        .map((entry) => entry.theme.id)
        .filter((id) => !featuredSet.has(id));
      expect(ordered.slice(FEATURED_IDS.length).map((entry) => entry.theme.id)).toEqual(
        restInCatalogOrder,
      );
    });
  });
});
