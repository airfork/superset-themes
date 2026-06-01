import { describe, expect, it } from "vitest";
import { BASELINE_IDS, getBaselineFirstThemes, getBaselineThemes } from "./baseline";
import { catalogThemes } from "./catalog";
import { FEATURED_IDS } from "./featured";

describe("baseline themes", () => {
  it("pins Superset's light and dark defaults in a stable order", () => {
    expect(BASELINE_IDS).toEqual(["superset-light", "superset-dark"]);
  });

  it("returns catalog entries with baseline ranks", () => {
    const baseline = getBaselineThemes();

    expect(baseline.map((entry) => entry.theme.id)).toEqual(["superset-light", "superset-dark"]);
    expect(baseline.map((entry) => entry.meta.baselineRank)).toEqual([1, 2]);
    expect(baseline.map((entry) => entry.meta.family)).toEqual(["Superset", "Superset"]);
  });

  it("tracks Superset Light's live app neutral tokens after hex conversion", () => {
    const supersetLight = getBaselineThemes().find((entry) => entry.theme.id === "superset-light");

    expect(supersetLight?.theme.ui).toMatchObject({
      accent: "#e8e8e8",
      background: "#ffffff",
      border: "#e5e5e5",
      foreground: "#0a0a0a",
      highlightActive: "#ffc58e",
      muted: "#f5f5f5",
      mutedForeground: "#737373",
      primary: "#171717",
      primaryForeground: "#fafafa",
      ring: "#a1a1a1",
      sidebar: "#fafafa",
      sidebarAccent: "#f5f5f5",
    });
  });

  it("tracks Superset Dark's pinned live app tokens without accessibility rewrites", () => {
    const supersetDark = getBaselineThemes().find((entry) => entry.theme.id === "superset-dark");

    expect(supersetDark?.theme.ui).toMatchObject({
      accent: "#2a2827",
      background: "#151110",
      border: "#2a2827",
      card: "#201e1c",
      destructive: "#cc4444",
      destructiveForeground: "#ffcccc",
      foreground: "#eae8e6",
      highlightActive: "#7b4530",
      muted: "#2a2827",
      mutedForeground: "#a8a5a3",
      primary: "#eae8e6",
      primaryForeground: "#151110",
      ring: "#3a3837",
      sidebar: "#1a1716",
      sidebarAccent: "#252220",
      sidebarPrimary: "#e07850",
    });
  });

  it("leads with baselines, then Featured, then the remaining catalog order", () => {
    const ordered = getBaselineFirstThemes();
    const pinnedIds = [...BASELINE_IDS, ...FEATURED_IDS];
    const pinnedSet = new Set<string>(pinnedIds);
    const restInCatalogOrder = catalogThemes
      .map((entry) => entry.theme.id)
      .filter((id) => !pinnedSet.has(id));

    expect(ordered.slice(0, pinnedIds.length).map((entry) => entry.theme.id)).toEqual(pinnedIds);
    expect(ordered.slice(pinnedIds.length).map((entry) => entry.theme.id)).toEqual(
      restInCatalogOrder,
    );
    expect(new Set(ordered.map((entry) => entry.theme.id)).size).toBe(catalogThemes.length);
  });
});
