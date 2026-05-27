import { describe, expect, it } from "vitest";
import { FEATURED_IDS, getDefaultFocusedTheme, getFeaturedThemes } from "./featured";

describe("featured themes", () => {
  it("exposes five hand-picked themes in deliberate order", () => {
    expect(FEATURED_IDS).toEqual([
      "tokyo-night",
      "catppuccin-mocha",
      "solarized-light",
      "rose-pine-dawn",
      "one-dark",
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
      "one-dark",
    ]);
    expect(featured.map((entry) => entry.meta.featuredRank)).toEqual([1, 2, 3, 4, 5]);
  });

  it("defaults the focused theme to the first featured slot", () => {
    expect(getDefaultFocusedTheme().theme.id).toBe("tokyo-night");
  });
});
