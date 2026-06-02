import { describe, expect, it } from "vitest";
import { buildCatalogThemes, catalogThemes, getRankedCatalogThemeIds } from "./catalog";

describe("buildCatalogThemes", () => {
  it("pairs metadata to theme JSON by themeId instead of positional index", () => {
    const [first, second] = catalogThemes;

    if (!first || !second) {
      throw new Error("Expected at least two catalog themes");
    }

    const metadata = [second.meta, first.meta];
    const themesById = {
      [first.theme.id]: first.theme,
      [second.theme.id]: second.theme,
    };

    const built = buildCatalogThemes(metadata, themesById);

    expect(built.map((entry) => entry.theme.id)).toEqual(metadata.map((meta) => meta.themeId));
    expect(built[0]?.meta).toBe(second.meta);
    expect(built[1]?.meta).toBe(first.meta);
  });
});

describe("getRankedCatalogThemeIds", () => {
  it("derives ordered ids from metadata ranks instead of catalog position", () => {
    const [first, second] = catalogThemes.filter((entry) => entry.meta.featuredRank !== null);

    if (!first || !second) {
      throw new Error("Expected at least two featured catalog themes");
    }

    const ranked = [
      { ...second, meta: { ...second.meta, featuredRank: 2 } },
      { ...first, meta: { ...first.meta, featuredRank: 1 } },
    ];

    expect(getRankedCatalogThemeIds(ranked, "featuredRank")).toEqual([
      first.theme.id,
      second.theme.id,
    ]);
  });
});
