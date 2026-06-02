import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { catalogThemes, getRankedCatalogThemeIds } from "./catalog";
import { FEATURED_IDS, getFeaturedThemes } from "./featured";

export const BASELINE_IDS = getRankedCatalogThemeIds(catalogThemes, "baselineRank");

export type BaselineId = (typeof BASELINE_IDS)[number];

export function getBaselineThemes(): CatalogThemeEntry[] {
  return BASELINE_IDS.map((id) => {
    const entry = catalogThemes.find((candidate) => candidate.theme.id === id);
    if (!entry) {
      throw new Error(`Baseline theme missing from catalog: ${id}`);
    }
    return entry;
  });
}

export function getDefaultLabTheme(): CatalogThemeEntry {
  const [first] = getBaselineThemes();
  if (!first) {
    throw new Error("Baseline theme list is empty.");
  }
  return first;
}

export function getBaselineFirstThemes(): CatalogThemeEntry[] {
  const pinnedSet = new Set<string>([...BASELINE_IDS, ...FEATURED_IDS]);
  const rest = catalogThemes.filter((entry) => !pinnedSet.has(entry.theme.id));
  return [...getBaselineThemes(), ...getFeaturedThemes(), ...rest];
}
