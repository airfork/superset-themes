import type { CatalogThemeEntry } from "../theme-core/themeTypes";
import { catalogThemes, getRankedCatalogThemeIds } from "./catalog";

export const FEATURED_IDS = getRankedCatalogThemeIds(catalogThemes, "featuredRank");

export type FeaturedId = (typeof FEATURED_IDS)[number];

export function getFeaturedThemes(): CatalogThemeEntry[] {
  return FEATURED_IDS.map((id) => {
    const entry = catalogThemes.find((candidate) => candidate.theme.id === id);
    if (!entry) {
      throw new Error(`Featured theme missing from catalog: ${id}`);
    }
    return entry;
  });
}

export function getDefaultFocusedTheme(): CatalogThemeEntry {
  const [first] = getFeaturedThemes();
  if (!first) {
    throw new Error("Featured theme list is empty.");
  }
  return first;
}

// The catalog reordered to lead with the featured block, then the remaining
// themes in catalog order. The rail groups Featured-first; the ⌘K palette reuses
// this so its resting order matches and a user's mental model carries between them.
export function getFeaturedFirstThemes(): CatalogThemeEntry[] {
  const featuredSet = new Set<string>(FEATURED_IDS);
  const rest = catalogThemes.filter((entry) => !featuredSet.has(entry.theme.id));
  return [...getFeaturedThemes(), ...rest];
}
